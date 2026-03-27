import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

// User operations
export const createUser = async (userId, userData) => {
  await setDoc(doc(db, 'users', userId), userData);
};

export const getUser = async (userId) => {
  const docSnap = await getDoc(doc(db, 'users', userId));
  return docSnap.exists() ? docSnap.data() : null;
};

// Course operations
export const getAllCourses = async () => {
  const querySnapshot = await getDocs(collection(db, 'courses'));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getCourse = async (courseId) => {
  const docSnap = await getDoc(doc(db, 'courses', courseId));
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

// Progress operations
export const getProgress = async (userId, courseId) => {
  const progressId = `${userId}_${courseId}`;
  const docSnap = await getDoc(doc(db, 'progress', progressId));
  return docSnap.exists()
    ? docSnap.data()
    : { userId, courseId, completedLessons: [] };
};

export const updateProgress = async (userId, courseId, completedLessons) => {
  const progressId = `${userId}_${courseId}`;
  await setDoc(doc(db, 'progress', progressId), {
    userId,
    courseId,
    completedLessons,
  });
};

export const toggleLessonComplete = async (userId, courseId, lessonId) => {
  const progress = await getProgress(userId, courseId);
  const completedLessons = progress.completedLessons || [];

  const newCompleted = completedLessons.includes(lessonId)
    ? completedLessons.filter((id) => id !== lessonId)
    : [...completedLessons, lessonId];

  await updateProgress(userId, courseId, newCompleted);
  return newCompleted;
};
