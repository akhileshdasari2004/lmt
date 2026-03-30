// src/services/courseService.js
// Clean, production-ready service layer for Course & Lesson CRUD

import { db } from './firebase';
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
  limit,
} from 'firebase/firestore';

// ==================== COURSE CRUD ====================

/**
 * Create a new course with optional lessons
 * @param {Object} courseData - { title, description, lessons: [{title, content}] }
 * @returns {Promise<string>} - Created course ID
 */
export const createCourse = async (courseData) => {
  const { lessons = [], ...courseFields } = courseData;

  // Create course document
  const courseRef = await addDoc(collection(db, 'courses'), {
    ...courseFields,
    lessonCount: lessons.length,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const courseId = courseRef.id;

  // Batch create lessons if provided
  if (lessons.length > 0) {
    const batch = writeBatch(db);

    lessons.forEach((lesson, index) => {
      const lessonRef = doc(collection(db, 'courses', courseId, 'lessons'));
      batch.set(lessonRef, {
        title: lesson.title,
        content: lesson.content || '',
        order: index,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  return courseId;
};

/**
 * Get all courses (lightweight - no lessons)
 * @returns {Promise<Array>} - Courses sorted by createdAt desc
 */
export const getCourses = async () => {
  const q = query(
    collection(db, 'courses'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null,
  }));
};

/**
 * Get single course with lessons
 * @param {string} courseId
 * @returns {Promise<Object|null>} - Course with lessons array
 */
export const getCourseWithLessons = async (courseId) => {
  // Get course
  const courseSnap = await getDoc(doc(db, 'courses', courseId));
  if (!courseSnap.exists()) return null;

  const course = {
    id: courseSnap.id,
    ...courseSnap.data(),
    createdAt: courseSnap.data().createdAt?.toDate?.() || null,
    updatedAt: courseSnap.data().updatedAt?.toDate?.() || null,
  };

  // Get lessons
  const lessonsQuery = query(
    collection(db, 'courses', courseId, 'lessons'),
    orderBy('order', 'asc')
  );
  const lessonsSnap = await getDocs(lessonsQuery);

  course.lessons = lessonsSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.() || null,
    updatedAt: doc.data().updatedAt?.toDate?.() || null,
  }));

  return course;
};

/**
 * Update course details
 * @param {string} courseId
 * @param {Object} updates
 */
export const updateCourse = async (courseId, updates) => {
  const courseRef = doc(db, 'courses', courseId);
  await updateDoc(courseRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete course and all lessons
 * @param {string} courseId
 */
export const deleteCourse = async (courseId) => {
  const batch = writeBatch(db);

  // Delete all lessons
  const lessonsSnap = await getDocs(
    collection(db, 'courses', courseId, 'lessons')
  );
  lessonsSnap.docs.forEach((lessonDoc) => {
    batch.delete(lessonDoc.ref);
  });

  // Delete course
  batch.delete(doc(db, 'courses', courseId));

  await batch.commit();
};

// ==================== LESSON CRUD ====================

/**
 * Add a single lesson to course
 * @param {string} courseId
 * @param {Object} lessonData
 * @returns {Promise<string>} - Lesson ID
 */
export const addLesson = async (courseId, lessonData) => {
  const courseRef = doc(db, 'courses', courseId);
  const courseSnap = await getDoc(courseRef);
  const currentCount = courseSnap.data()?.lessonCount || 0;

  // Create lesson
  const lessonRef = await addDoc(
    collection(db, 'courses', courseId, 'lessons'),
    {
      ...lessonData,
      order: currentCount,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  // Update lesson count
  await updateDoc(courseRef, {
    lessonCount: currentCount + 1,
    updatedAt: serverTimestamp(),
  });

  return lessonRef.id;
};

/**
 * Update lesson
 * @param {string} courseId
 * @param {string} lessonId
 * @param {Object} updates
 */
export const updateLesson = async (courseId, lessonId, updates) => {
  const lessonRef = doc(db, 'courses', courseId, 'lessons', lessonId);
  await updateDoc(lessonRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Delete lesson and reorder remaining
 * @param {string} courseId
 * @param {string} lessonId
 */
export const deleteLesson = async (courseId, lessonId) => {
  const batch = writeBatch(db);

  // Get lesson order
  const lessonSnap = await getDoc(
    doc(db, 'courses', courseId, 'lessons', lessonId)
  );
  const deletedOrder = lessonSnap.data()?.order || 0;

  // Delete lesson
  batch.delete(doc(db, 'courses', courseId, 'lessons', lessonId));

  // Update higher-order lessons
  const higherLessons = await getDocs(
    query(
      collection(db, 'courses', courseId, 'lessons'),
      where('order', '>', deletedOrder)
    )
  );

  higherLessons.docs.forEach((doc) => {
    batch.update(doc.ref, {
      order: doc.data().order - 1,
      updatedAt: serverTimestamp(),
    });
  });

  // Update course count
  const courseRef = doc(db, 'courses', courseId);
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
 * @param {Array} lessonIds - Ordered array of lesson IDs
 */
export const reorderLessons = async (courseId, lessonIds) => {
  const batch = writeBatch(db);

  lessonIds.forEach((id, index) => {
    batch.update(doc(db, 'courses', courseId, 'lessons', id), {
      order: index,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

// ==================== BULK OPERATIONS ====================

/**
 * Update course and sync lessons
 * @param {string} courseId
 * @param {Object} courseData
 * @param {Array} lessons - Array of lessons (with id for existing)
 */
export const updateCourseWithLessons = async (courseId, courseData, lessons) => {
  const batch = writeBatch(db);
  const courseRef = doc(db, 'courses', courseId);

  // Update course
  batch.update(courseRef, {
    ...courseData,
    lessonCount: lessons.length,
    updatedAt: serverTimestamp(),
  });

  // Handle lessons
  let order = 0;
  for (const lesson of lessons) {
    if (lesson.id && !lesson.id.startsWith('temp-')) {
      // Update existing
      batch.update(doc(db, 'courses', courseId, 'lessons', lesson.id), {
        title: lesson.title,
        content: lesson.content || '',
        order: order++,
        updatedAt: serverTimestamp(),
      });
    } else {
      // Create new
      const newLessonRef = doc(collection(db, 'courses', courseId, 'lessons'));
      batch.set(newLessonRef, {
        title: lesson.title,
        content: lesson.content || '',
        order: order++,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  }

  await batch.commit();
};
