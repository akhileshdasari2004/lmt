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
  await setDoc(doc(db, "users", userId), { ...userData, role });
};

export const getUser = async (userId) => {
  const docSnap = await getDoc(doc(db, "users", userId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const setUserRole = async (userId, role) => {
  await updateDoc(doc(db, "users", userId), { role });
};

export const getUserRole = async (userId) => {
  const user = await getUser(userId);
  return user?.role || "student";
};

// Course operations
export const getAllCourses = async () => {
  const querySnapshot = await getDocs(collection(db, "courses"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getCourse = async (courseId) => {
  const docSnap = await getDoc(doc(db, "courses", courseId));
  if (!docSnap.exists()) return null;

  const courseData = { id: docSnap.id, ...docSnap.data() };

  // Fetch lessons from subcollection
  try {
    const lessonsSnapshot = await getDocs(
      collection(db, "courses", courseId, "lessons"),
    );
    const lessons = lessonsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    courseData.lessons = lessons;
  } catch (err) {
    console.error("Error fetching lessons:", err);
    courseData.lessons = [];
  }

  return courseData;
};

// Progress operations
export const getProgress = async (userId, courseId) => {
  const progressId = `${userId}_${courseId}`;
  const docSnap = await getDoc(doc(db, "progress", progressId));
  return docSnap.exists()
    ? docSnap.data()
    : { userId, courseId, completedLessons: [] };
};

export const updateProgress = async (userId, courseId, completedLessons) => {
  const progressId = `${userId}_${courseId}`;
  await setDoc(doc(db, "progress", progressId), {
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
