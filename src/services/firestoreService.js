import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// User operations
export const createUser = async (userId, userData, role = "student") => {
  console.log("createUser called:", { userId, userData, role });
  try {
    const userDoc = { ...userData, role };
    console.log("Creating user document:", userDoc);
    await setDoc(doc(db, "users", userId), userDoc);
    console.log("✅ User document created successfully");
  } catch (err) {
    console.error("❌ Error creating user:", err);
    throw err;
  }
};

export const getUser = async (userId) => {
  console.log("getUser called for:", userId);
  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    console.log("User doc exists:", docSnap.exists());
    console.log("User doc data:", docSnap.data());
    return docSnap.exists() ? docSnap.data() : null;
  } catch (err) {
    console.error("Error getting user:", err);
    throw err;
  }
};

export const setUserRole = async (userId, role) => {
  console.log(`setUserRole called: userId=${userId}, role=${role}`);
  try {
    await updateDoc(doc(db, "users", userId), { role });
    console.log(`✅ User role updated to ${role}`);
  } catch (err) {
    console.error("Error setting user role:", err);
    throw err;
  }
};

export const getAllUsers = async () => {
  console.log("getAllUsers called");
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    console.log("Users fetched:", users);
    return users;
  } catch (err) {
    console.error("Error fetching all users:", err);
    throw err;
  }
};

export const getUserRole = async (userId) => {
  console.log("getUserRole called for:", userId);
  const user = await getUser(userId);
  console.log("User data:", user);
  const role = user?.role || "student";
  console.log("Determined role:", role);
  return role;
};

export const initializeNewUser = async (userId, email, name) => {
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        uid: userId,
        email,
        name: name || "",
        role: "student",
        status: "pending",
        requestedAt: serverTimestamp(),
        approvedAt: null,
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Error initializing new user:", err);
    throw err;
  }
};

// Lesson request & assignment operations
export const createLessonRequest = async (
  studentId,
  studentEmail,
  studentName,
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
) => {
  const ref = doc(collection(db, "lessonRequests"));
  await setDoc(ref, {
    requestId: ref.id,
    studentId,
    studentEmail,
    studentName,
    courseId,
    courseTitle,
    lessonId,
    lessonTitle,
    status: "pending",
    requestedAt: serverTimestamp(),
  });
  return ref.id;
};

export const createSubjectRequest = async (
  studentId,
  studentEmail,
  studentName,
  courseId,
  courseTitle,
) => {
  const ref = doc(collection(db, "lessonRequests"));
  await setDoc(ref, {
    requestId: ref.id,
    studentId,
    studentEmail,
    studentName,
    courseId,
    courseTitle,
    lessonId: null,
    lessonTitle: null,
    requestType: "subject",
    status: "pending",
    requestedAt: serverTimestamp(),
  });
  return ref.id;
};

export const assignLessonToStudent = async (studentId, lessonData) => {
  const ref = doc(db, "assignments", studentId);
  await setDoc(
    ref,
    {
      studentId,
      assignedLessons: arrayUnion({
        ...lessonData,
        assignedAt: new Date().toISOString(),
      }),
    },
    { merge: true },
  );
};

export const assignSubjectToStudent = async (studentId, courseData) => {
  const ref = doc(db, "assignments", studentId);
  await setDoc(
    ref,
    {
      studentId,
      assignedLessons: arrayUnion({
        courseId: courseData.courseId,
        courseTitle: courseData.courseTitle,
        lessonId: null,
        lessonTitle: null,
        assignmentType: "subject",
        assignedAt: new Date().toISOString(),
      }),
    },
    { merge: true },
  );
};

export const revokeLessonAssignment = async (studentId, lessonData) => {
  const ref = doc(db, "assignments", studentId);
  await updateDoc(ref, {
    assignedLessons: arrayRemove(lessonData),
  });
};

export const approveStudent = async (studentId) => {
  const ref = doc(db, "users", studentId);
  await updateDoc(ref, {
    status: "approved",
    approvedAt: serverTimestamp(),
  });
};

export const getAllStudents = (callback) => {
  const q = query(collection(db, "users"), where("role", "==", "student"));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
      })),
    );
  });
};

export const getStudentRequests = (studentId, callback) => {
  const q = query(
    collection(db, "lessonRequests"),
    where("studentId", "==", studentId),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
};

export const getAllPendingRequests = (callback) => {
  const q = query(
    collection(db, "lessonRequests"),
    where("status", "==", "pending"),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data()));
  });
};

export const setLessonRequestStatus = async (requestId, status) => {
  await updateDoc(doc(db, "lessonRequests", requestId), { status });
};

export const getStudentAssignments = (studentId, callback) => {
  const ref = doc(db, "assignments", studentId);
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? snap.data().assignedLessons || [] : []);
  });
};

// Course operations
export const getAllCourses = async () => {
  try {
    console.log("📚 getAllCourses called");
    const querySnapshot = await getDocs(collection(db, "courses"));
    console.log(`Found ${querySnapshot.docs.length} courses`);

    const coursesData = await Promise.all(
      querySnapshot.docs.map(async (doc) => {
        const courseData = {
          id: doc.id,
          ...doc.data(),
        };

        // Fetch lessons for each course
        try {
          console.log(`Fetching lessons for course: ${doc.id}`);
          const lessonsSnapshot = await getDocs(
            collection(db, "courses", doc.id, "lessons"),
          );
          console.log(
            `Found ${lessonsSnapshot.docs.length} lessons for course ${doc.id}`,
          );

          const lessons = lessonsSnapshot.docs
            .map((lessonDoc) => ({ id: lessonDoc.id, ...lessonDoc.data() }))
            .sort((a, b) => (a.order || 0) - (b.order || 0));
          courseData.lessons = lessons;
        } catch (err) {
          console.error(`Error fetching lessons for course ${doc.id}:`, err);
          courseData.lessons = [];
        }

        return courseData;
      }),
    );

    console.log(
      "✅ getAllCourses complete. Courses with lessons:",
      coursesData,
    );
    return coursesData;
  } catch (err) {
    console.error("❌ Error fetching all courses:", err);
    throw err;
  }
};

export const getCourse = async (courseId) => {
  try {
    console.log(`📖 getCourse called for: ${courseId}`);
    const docSnap = await getDoc(doc(db, "courses", courseId));
    if (!docSnap.exists()) {
      console.log(`⚠️ Course not found: ${courseId}`);
      return null;
    }

    console.log(`✅ Course found: ${courseId}`);
    const courseData = { id: docSnap.id, ...docSnap.data() };

    // Fetch lessons from subcollection
    try {
      console.log(`Fetching lessons for course: ${courseId}`);
      const lessonsSnapshot = await getDocs(
        collection(db, "courses", courseId, "lessons"),
      );
      console.log(
        `Found ${lessonsSnapshot.docs.length} lessons for course ${courseId}`,
      );

      const lessons = lessonsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      courseData.lessons = lessons;
      console.log(
        `✅ getCourse complete with ${lessons.length} lessons:`,
        lessons,
      );
    } catch (err) {
      console.error(`Error fetching lessons for course ${courseId}:`, err);
      courseData.lessons = [];
    }

    return courseData;
  } catch (err) {
    console.error(`❌ Error getting course ${courseId}:`, err);
    throw err;
  }
};

// Progress operations
// Storage: /progress/{userId}_{courseId}
export const getProgressDocId = (userId, courseId) => `${userId}_${courseId}`;

export const getOrCreateProgress = async (userId, courseId) => {
  try {
    if (!userId || !courseId) {
      return { userId, courseId, completedLessons: [] };
    }

    const progressId = getProgressDocId(userId, courseId);
    const progressDocRef = doc(db, "progress", progressId);
    const docSnap = await getDoc(progressDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }

    const initialProgress = {
      userId,
      courseId,
      completedLessons: [],
    };

    await setDoc(progressDocRef, initialProgress, { merge: false });
    return initialProgress;
  } catch (err) {
    console.error("Error in getOrCreateProgress:", err);
    throw err;
  }
};

export const getProgress = async (userId, courseId) => {
  try {
    if (!userId || !courseId) {
      return { userId, courseId, completedLessons: [] };
    }

    return await getOrCreateProgress(userId, courseId);
  } catch (err) {
    console.error("Error fetching progress:", err.message);
    throw err;
  }
};

export const updateProgress = async (userId, courseId, completedLessons) => {
  try {
    const progressId = getProgressDocId(userId, courseId);
    const progressDocRef = doc(db, "progress", progressId);
    await setDoc(
      progressDocRef,
      {
        userId,
        courseId,
        completedLessons,
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Error updating progress:", err);
    throw err;
  }
};

export const toggleLessonComplete = async (userId, courseId, lessonId) => {
  try {
    const progress = await getOrCreateProgress(userId, courseId);
    const completedLessons = progress.completedLessons || [];
    const progressId = getProgressDocId(userId, courseId);
    const progressDocRef = doc(db, "progress", progressId);

    if (completedLessons.includes(lessonId)) {
      await updateDoc(progressDocRef, {
        completedLessons: arrayRemove(lessonId),
      });
      return completedLessons.filter((id) => id !== lessonId);
    }

    await updateDoc(progressDocRef, {
      completedLessons: arrayUnion(lessonId),
    });
    const newCompleted = [...completedLessons, lessonId];
    return newCompleted;
  } catch (err) {
    console.error("Error toggling lesson:", err);
    throw err;
  }
};
