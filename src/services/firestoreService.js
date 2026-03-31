import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
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
// Storage: /users/{userId}/progress/{courseId}
export const getProgress = async (userId, courseId) => {
  try {
    console.log(`📊 Fetching progress: user=${userId}, course=${courseId}`);

    if (!userId || !courseId) {
      console.warn("⚠️ Missing userId or courseId");
      return { courseId, completedLessons: [] };
    }

    const progressDocRef = doc(db, "users", userId, "progress", courseId);
    const docSnap = await getDoc(progressDocRef);

    if (docSnap.exists()) {
      console.log("✅ Progress found:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("ℹ️ No progress yet, initializing with empty array");
      // Initialize new progress document
      const initialProgress = {
        courseId,
        completedLessons: [],
        createdAt: new Date(),
      };
      await setDoc(progressDocRef, initialProgress);
      return initialProgress;
    }
  } catch (err) {
    console.error("❌ Error fetching progress:", err.message);
    throw err;
  }
};

export const updateProgress = async (userId, courseId, completedLessons) => {
  try {
    const progressDocRef = doc(db, "users", userId, "progress", courseId);
    await setDoc(
      progressDocRef,
      {
        courseId,
        completedLessons,
        updatedAt: new Date(),
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
    const progress = await getProgress(userId, courseId);
    const completedLessons = progress.completedLessons || [];

    const newCompleted = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId];

    await updateProgress(userId, courseId, newCompleted);
    return newCompleted;
  } catch (err) {
    console.error("Error toggling lesson:", err);
    throw err;
  }
};
