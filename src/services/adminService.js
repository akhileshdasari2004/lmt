/**
 * Admin Service
 * Central service for all admin operations including courses, enrollments, and analytics
 */

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
  limit,
} from "firebase/firestore";
import { deleteObject, ref, getStorage } from "firebase/storage";

const storage = getStorage();

// ============================================================================
// COURSE OPERATIONS
// ============================================================================

/**
 * Create a new course with lectures and chapters
 * @param {Object} courseData - Course details
 * @returns {Promise<string>} - Created course ID
 */
export const addCourse = async (courseData) => {
  try {
    const {
      courseName,
      instructor,
      category,
      imageUrl,
      rating = 0,
      pricingType = "free",
      price = 0,
      lectures = [],
    } = courseData;

    // Calculate totals
    const totalLectures = lectures.length;
    const totalDuration = lectures.reduce((sum, lecture) => {
      const lectureDuration =
        lecture.chapters?.reduce((chapterSum, chapter) => {
          return chapterSum + (chapter.duration || 0);
        }, 0) || 0;
      return sum + lectureDuration;
    }, 0);

    const courseRef = await addDoc(collection(db, "courses"), {
      courseName,
      instructor,
      category,
      imageUrl,
      rating: parseFloat(rating),
      pricingType,
      price: pricingType === "paid" ? parseFloat(price) : 0,
      lectures, // Store entire lecture structure
      totalLectures,
      totalDuration,
      totalEnrolled: 0,
      totalRevenue: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { success: true, courseId: courseRef.id };
  } catch (error) {
    console.error("Error adding course:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Update course details
 * @param {string} courseId
 * @param {Object} courseData
 */
export const updateCourseAdmin = async (courseId, courseData) => {
  try {
    const {
      courseName,
      instructor,
      category,
      imageUrl,
      rating,
      pricingType,
      price,
      lectures = [],
    } = courseData;

    // Recalculate totals
    const totalLectures = lectures.length;
    const totalDuration = lectures.reduce((sum, lecture) => {
      const lectureDuration =
        lecture.chapters?.reduce((chapterSum, chapter) => {
          return chapterSum + (chapter.duration || 0);
        }, 0) || 0;
      return sum + lectureDuration;
    }, 0);

    await updateDoc(doc(db, "courses", courseId), {
      courseName,
      instructor,
      category,
      imageUrl,
      rating: parseFloat(rating),
      pricingType,
      price: pricingType === "paid" ? parseFloat(price) : 0,
      lectures,
      totalLectures,
      totalDuration,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all courses for admin
 */
export const getAllCoursesForAdmin = async () => {
  try {
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    }));
  } catch (error) {
    console.error("Error fetching courses:", error);
    return [];
  }
};

/**
 * Get single course by ID
 */
export const getCourseForAdmin = async (courseId) => {
  try {
    const docSnap = await getDoc(doc(db, "courses", courseId));
    if (!docSnap.exists()) return null;
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    return null;
  }
};

/**
 * Delete course and its image from storage
 */
export const deleteCourseAdmin = async (courseId, imageUrl) => {
  try {
    const batch = writeBatch(db);

    // Delete all enrollments for this course
    const enrollmentsSnapshot = await getDocs(
      query(collection(db, "enrollments"), where("courseId", "==", courseId)),
    );
    enrollmentsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete course document
    batch.delete(doc(db, "courses", courseId));
    await batch.commit();

    // Delete image from storage if it exists
    if (imageUrl) {
      try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      } catch (err) {
        console.warn(
          "Image deletion failed (may have already been deleted):",
          err,
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// ENROLLMENT/BOOKING OPERATIONS
// ============================================================================

/**
 * Get all enrollments/bookings
 */
export const getAllEnrollments = async () => {
  try {
    const q = query(
      collection(db, "enrollments"),
      orderBy("enrollmentDate", "desc"),
    );
    const snapshot = await getDocs(q);

    const enrollments = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Fetch student name from users collection
      const studentDoc = await getDoc(doc(db, "users", data.studentId));
      const studentName = studentDoc.data()?.name || "Unknown Student";

      // Fetch course name
      const courseDoc = await getDoc(doc(db, "courses", data.courseId));
      const courseName = courseDoc.data()?.courseName || "Unknown Course";

      enrollments.push({
        id: doc.id,
        studentName,
        courseName,
        studentId: data.studentId,
        courseId: data.courseId,
        price: data.price || 0,
        enrollmentDate: data.enrollmentDate?.toDate?.() || new Date(),
        status: data.status || "enrolled",
      });
    }

    return enrollments;
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return [];
  }
};

/**
 * Create enrollment record
 */
export const createEnrollment = async (studentId, courseId, price = 0) => {
  try {
    const enrollmentRef = await addDoc(collection(db, "enrollments"), {
      studentId,
      courseId,
      price,
      enrollmentDate: serverTimestamp(),
      status: "enrolled",
    });

    // Update course enrollment count
    const courseDoc = await getDoc(doc(db, "courses", courseId));
    const currentEnrolled = courseDoc.data()?.totalEnrolled || 0;
    const currentRevenue = courseDoc.data()?.totalRevenue || 0;

    await updateDoc(doc(db, "courses", courseId), {
      totalEnrolled: currentEnrolled + 1,
      totalRevenue: currentRevenue + price,
    });

    return { success: true, enrollmentId: enrollmentRef.id };
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    // Get all courses
    const coursesSnapshot = await getDocs(collection(db, "courses"));
    const courses = coursesSnapshot.docs.map((doc) => doc.data());

    // Get all enrollments
    const enrollmentsSnapshot = await getDocs(collection(db, "enrollments"));
    const enrollments = enrollmentsSnapshot.docs.map((doc) => doc.data());

    // Calculate stats
    const totalCourses = courses.length;
    const totalEnrollments = enrollments.length;
    const totalRevenue = courses.reduce(
      (sum, course) => sum + (course.totalRevenue || 0),
      0,
    );

    // Get enrollments from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const enrollmentsLast7Days = enrollments.filter((enrollment) => {
      const enrollDate =
        enrollment.enrollmentDate?.toDate?.() ||
        new Date(enrollment.enrollmentDate);
      return enrollDate >= sevenDaysAgo;
    }).length;

    return {
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue.toFixed(2),
      enrollmentsLast7Days,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalCourses: 0,
      totalEnrollments: 0,
      totalRevenue: 0,
      enrollmentsLast7Days: 0,
    };
  }
};

/**
 * Get course analytics for dashboard table
 */
export const getCourseAnalytics = async () => {
  try {
    const coursesSnapshot = await getDocs(
      query(collection(db, "courses"), orderBy("totalEnrolled", "desc")),
    );

    const courseAnalytics = coursesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        courseName: data.courseName,
        instructor: data.instructor,
        price: data.price || 0,
        totalEnrolled: data.totalEnrolled || 0,
        totalRevenue: data.totalRevenue || 0,
        pricingType: data.pricingType,
        category: data.category,
      };
    });

    return courseAnalytics;
  } catch (error) {
    console.error("Error fetching course analytics:", error);
    return [];
  }
};

/**
 * Search courses by name or category
 */
export const searchCourses = async (searchTerm) => {
  try {
    const allCourses = await getAllCoursesForAdmin();
    return allCourses.filter(
      (course) =>
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  } catch (error) {
    console.error("Error searching courses:", error);
    return [];
  }
};
