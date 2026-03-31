// src/services/adminCourseService.js
import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  where,
} from "firebase/firestore";

// ==================== COURSE OPERATIONS ====================

/**
 * Create a new course
 * @param {Object} courseData - { title, description, createdBy }
 * @returns {Promise<string>} - Created course ID
 */
export const createCourse = async (courseData) => {
  const courseRef = await addDoc(collection(db, "courses"), {
    ...courseData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lessonCount: 0,
  });
  return courseRef.id;
};

/**
 * Get all courses with metadata
 * @returns {Promise<Array>} - Array of courses
 */
export const getAllCoursesAdmin = async () => {
  const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null,
  }));
};

/**
 * Get single course by ID
 * @param {string} courseId
 * @returns {Promise<Object|null>}
 */
export const getCourseById = async (courseId) => {
  const docSnap = await getDoc(doc(db, "courses", courseId));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || null,
    updatedAt: docSnap.data().updatedAt?.toDate?.() || null,
  };
};

/**
 * Update course details
 * @param {string} courseId
 * @param {Object} updates - { title, description }
 */
export const updateCourse = async (courseId, updates) => {
  const courseRef = doc(db, "courses", courseId);
  await updateDoc(courseRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete course and all its lessons
 * @param {string} courseId
 */
export const deleteCourse = async (courseId) => {
  const batch = writeBatch(db);

  // Delete all lessons in subcollection
  const lessonsSnapshot = await getDocs(
    collection(db, "courses", courseId, "lessons"),
  );
  lessonsSnapshot.docs.forEach((lessonDoc) => {
    batch.delete(lessonDoc.ref);
  });

  // Delete course document
  batch.delete(doc(db, "courses", courseId));

  await batch.commit();
};

// ==================== LESSON OPERATIONS ====================

/**
 * Create a new lesson in a course
 * @param {string} courseId
 * @param {Object} lessonData - { title, content, order }
 * @returns {Promise<string>} - Created lesson ID
 */
export const createLesson = async (courseId, lessonData) => {
  const lessonsRef = collection(db, "courses", courseId, "lessons");

  // Get current lesson count for ordering
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  const currentCount = courseSnap.data()?.lessonCount || 0;

  // Create lesson with next order
  const lessonRef = await addDoc(lessonsRef, {
    ...lessonData,
    order: lessonData.order ?? currentCount,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update course lesson count
  await updateDoc(courseRef, {
    lessonCount: currentCount + 1,
    updatedAt: serverTimestamp(),
  });

  return lessonRef.id;
};

/**
 * Get all lessons for a course (ordered)
 * @param {string} courseId
 * @returns {Promise<Array>}
 */
export const getLessonsByCourse = async (courseId) => {
  const q = query(
    collection(db, "courses", courseId, "lessons"),
    orderBy("order", "asc"),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null,
  }));
};

/**
 * Get single lesson
 * @param {string} courseId
 * @param {string} lessonId
 * @returns {Promise<Object|null>}
 */
export const getLessonById = async (courseId, lessonId) => {
  const docSnap = await getDoc(
    doc(db, "courses", courseId, "lessons", lessonId),
  );
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() || null,
    updatedAt: docSnap.data().updatedAt?.toDate?.() || null,
  };
};

/**
 * Update lesson
 * @param {string} courseId
 * @param {string} lessonId
 * @param {Object} updates
 */
export const updateLesson = async (courseId, lessonId, updates) => {
  const lessonRef = doc(db, "courses", courseId, "lessons", lessonId);
  await updateDoc(lessonRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete lesson and reorder remaining lessons
 * @param {string} courseId
 * @param {string} lessonId
 */
export const deleteLesson = async (courseId, lessonId) => {
  const batch = writeBatch(db);

  // Get the lesson being deleted to know its order
  const lessonRef = doc(db, "courses", courseId, "lessons", lessonId);
  const lessonSnap = await getDoc(lessonRef);
  const deletedOrder = lessonSnap.data()?.order || 0;

  // Delete the lesson
  batch.delete(lessonRef);

  // Get all lessons with higher order and decrement them
  const lessonsQuery = query(
    collection(db, "courses", courseId, "lessons"),
    where("order", ">", deletedOrder),
  );
  const higherLessons = await getDocs(lessonsQuery);

  higherLessons.docs.forEach((doc) => {
    batch.update(doc.ref, {
      order: doc.data().order - 1,
      updatedAt: serverTimestamp(),
    });
  });

  // Update course lesson count
  const courseRef = doc(db, "courses", courseId);
  const courseSnap = await getDoc(courseRef);
  const currentCount = courseSnap.data()?.lessonCount || 0;
  batch.update(courseRef, {
    lessonCount: Math.max(0, currentCount - 1),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();
};

/**
 * Reorder lessons
 * @param {string} courseId
 * @param {Array} orderedLessonIds - Array of lesson IDs in new order
 */
export const reorderLessons = async (courseId, orderedLessonIds) => {
  const batch = writeBatch(db);

  orderedLessonIds.forEach((lessonId, index) => {
    const lessonRef = doc(db, "courses", courseId, "lessons", lessonId);
    batch.update(lessonRef, {
      order: index,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

/**
 * Bulk create lessons for a course
 * @param {string} courseId
 * @param {Array} lessons - Array of { title, content }
 */
export const bulkCreateLessons = async (courseId, lessons) => {
  try {
    console.log(
      `📚 bulkCreateLessons called for course: ${courseId}, lessons: ${lessons.length}`,
    );

    const batch = writeBatch(db);
    const courseRef = doc(db, "courses", courseId);

    // Get current lesson count
    const courseSnap = await getDoc(courseRef);
    if (!courseSnap.exists()) {
      throw new Error(`Course ${courseId} does not exist`);
    }

    const startCount = courseSnap.data()?.lessonCount || 0;
    console.log(`Current lessonCount: ${startCount}`);

    const createdLessonIds = [];

    lessons.forEach((lesson, index) => {
      const lessonRef = doc(collection(db, "courses", courseId, "lessons"));
      console.log(`Creating lesson ${index + 1}:`, lesson.title);
      batch.set(lessonRef, {
        ...lesson,
        order: startCount + index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      createdLessonIds.push(lessonRef.id);
    });

    // Update course lesson count
    const newCount = startCount + lessons.length;
    console.log(
      `Updating course lessonCount from ${startCount} to ${newCount}`,
    );
    batch.update(courseRef, {
      lessonCount: newCount,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    console.log(
      `✅ bulkCreateLessons successful. Created ${createdLessonIds.length} lessons`,
    );
    return createdLessonIds;
  } catch (err) {
    console.error("❌ Error in bulkCreateLessons:", err);
    throw err;
  }
};
