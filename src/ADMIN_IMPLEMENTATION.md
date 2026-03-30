# Admin Panel - Implementation Guide

## 📋 Quick Start

### Step 1: Access Admin Dashboard

```
URL: http://localhost:5173/admin/dashboard
```

### Step 2: Login (if not already authenticated)

- Navigate to: `/admin/login`
- Use admin credentials from seed data: `admin@example.com`
- Or grant admin role to your user via `/admin/management`

### Step 3: Navigate the Admin Panel

The sidebar provides three main sections:

1. **📊 Dashboard** - View analytics and metrics
2. **📚 Courses** - Manage courses and content
3. **📋 Bookings** - Track enrollments

---

## 🏗️ Architecture Overview

### File Structure

```
src/
├── services/
│   └── adminService.js              [NEW] Central admin API
│
├── hooks/
│   └── useAdminOperations.js         [NEW] Admin state management
│
├── components/admin/
│   ├── AdminSidebar.jsx              [NEW] Navigation
│   ├── StatsCard.jsx                 [NEW] Metric cards
│   ├── LectureBuilder.jsx            [NEW] Content builder
│   ├── CourseAnalyticsTable.jsx      [NEW] Analytics table
│   ├── CourseEnrollmentTable.jsx     [NEW] Enrollment table
│   └── [existing components]
│
├── pages/
│   ├── AdminDashboardNew.jsx         [NEW] Performance dashboard
│   ├── AdminCoursesPage.jsx          [NEW] Course listing
│   ├── AdminCourseForm.jsx           [NEW] Course form
│   ├── AdminBookingsPage.jsx         [NEW] Booking listing
│   └── [existing pages]
│
└── App.jsx                           [UPDATED] New routes
```

### Data Flow

```
User (Admin)
    ↓
App.jsx (Protected Routes)
    ↓
AdminDashboard / AdminCoursesPage / AdminBookingsPage
    ↓
Components (Sidebar, StatsCard, Tables, etc.)
    ↓
Hooks (useAdminOperations)
    ↓
Services (adminService.js)
    ↓
Firestore (Database)
    ↓
Firebase Storage (Images)
```

---

## 📚 Core Components

### 1. AdminSidebar

**Purpose:** Main navigation for admin panel

```jsx
<AdminSidebar />
```

**Features:**

- Active link highlighting
- Dashboard, Courses, Bookings links
- Dark theme design

### 2. StatsCard

**Purpose:** Display single metric

```jsx
<StatsCard
  icon="📊"
  label="Total Courses"
  value={42}
  color="blue"
  trend={{ isPositive: true, percentage: 15 }}
/>
```

**Colors:** blue, green, purple, orange

### 3. CourseAnalyticsTable

**Purpose:** Show course performance data

```jsx
<CourseAnalyticsTable courses={courses} />
```

**Displays:** Name, instructor, price, students, revenue

### 4. LectureBuilder

**Purpose:** Add/edit course content

```jsx
<LectureBuilder lectures={lectures} onUpdate={handleLecturesUpdate} />
```

**Features:**

- Add/remove lectures
- Add/remove chapters
- Video URL and duration fields
- Real-time updates

### 5. CourseEnrollmentTable

**Purpose:** Display enrollment records

```jsx
<EnrollmentTable enrollments={enrollments} onDelete={handleDelete} />
```

**Shows:** Student, course, price, date, status

---

## 🔧 Service Layer (adminService.js)

### Course Operations

#### Create Course

```javascript
const result = await addCourse({
  courseName: "React Fundamentals",
  instructor: "Jane Doe",
  category: "programming",
  imageUrl: "https://...",
  rating: 4.5,
  pricingType: "paid",
  price: 49.99,
  lectures: [
    {
      title: "Module 1",
      chapters: [
        {
          title: "Chapter 1",
          videoUrl: "https://...",
          duration: 30,
        },
      ],
    },
  ],
});
// Returns: { success: true, courseId: "..." }
```

#### Update Course

```javascript
await updateCourseAdmin(courseId, {
  courseName: "Updated Name",
  price: 59.99,
  // ... other fields
});
```

#### Delete Course

```javascript
await deleteCourseAdmin(courseId, imageUrl);
// Deletes: course doc, enrollments, image file
```

#### Fetch Courses

```javascript
const courses = await getAllCoursesForAdmin();
const course = await getCourseForAdmin(courseId);
```

### Enrollment Operations

#### Get All Enrollments

```javascript
const enrollments = await getAllEnrollments();
// Returns enrollment records with student/course names
```

#### Create Enrollment

```javascript
await createEnrollment(studentId, courseId, price);
// Also updates course totalEnrolled and totalRevenue
```

### Analytics

#### Dashboard Stats

```javascript
const stats = await getDashboardStats();
// Returns:
// {
//   totalCourses: number,
//   totalEnrollments: number,
//   totalRevenue: number,
//   enrollmentsLast7Days: number
// }
```

#### Course Analytics

```javascript
const analytics = await getCourseAnalytics();
// Returns courses sorted by enrollment, with revenue data
```

---

## 🎯 Usage Workflows

### Workflow 1: Creating a Course

1. Navigate to `/admin/courses`
2. Click "+ New Course"
3. Fill form:
   ```
   Course Name: "JavaScript Mastery"
   Instructor: "John Developer"
   Category: "programming"
   Rating: 4.5
   Pricing: Paid
   Price: $99.99
   Image: [upload file]
   ```
4. Add Lectures:
   ```
   Lecture 1:
     - Title: "Fundamentals"
     - Chapter 1:
       * Title: "Variables and Types"
       * Video: https://...
       * Duration: 45 min
     - Chapter 2:
       * Title: "Functions"
       * Video: https://...
       * Duration: 50 min
   ```
5. Click "Create Course"
6. Redirects to `/admin/courses` list

**Database Result:**

- Saves to `courses/{courseId}`
- Calculates: `totalLectures` (1), `totalDuration` (95)
- Sets: `totalEnrolled` (0), `totalRevenue` (0)

### Workflow 2: Editing a Course

1. Navigate to `/admin/courses`
2. Find course in table
3. Click "Edit"
4. Modify any fields
5. Click "Update Course"
6. Returns to courses list

### Workflow 3: Viewing Dashboard

1. Navigate to `/admin/dashboard`
2. See stats cards:
   - Total Courses
   - Total Enrollments
   - Total Revenue
   - Last 7 Days
3. Scroll down for Course Performance table
4. Shows top courses by enrollment

### Workflow 4: Managing Enrollments

1. Navigate to `/admin/bookings`
2. View enrollment stats
3. Search by student/course name
4. Sort by date/student/course
5. See student names and prices

### Workflow 5: Deleting a Course

1. Navigate to `/admin/courses`
2. Find course
3. Click "Delete"
4. Confirm dialog
5. System deletes:
   - Course document
   - All enrollments for that course
   - Image from Firebase Storage

---

## 🔐 Security & Permissions

### Role-Based Access

```javascript
// Only admins can access:
- /admin/dashboard
- /admin/courses
- /admin/bookings
- /admin/courses/new
- /admin/courses/edit/*
```

### Authentication Flow

```
Login (/admin/login)
    ↓
Firebase Auth (email/password)
    ↓
Check: user.role == "admin" in Firestore
    ↓
If admin: Allow access
↓ If not: Redirect to /admin/login
```

### Permission Levels

| Route              | Required   | Check                                   |
| ------------------ | ---------- | --------------------------------------- |
| /admin/\*          | Admin role | Firestore `users/{uid}.role == "admin"` |
| /admin/courses     | Admin role | Same                                    |
| /admin/bookings    | Admin role | Same                                    |
| /admin/courses/new | Admin role | Same                                    |
| /admin/dashboard   | Admin role | Same                                    |

---

## 📊 Firestore Schema

### Collections Structure

```
firestore/
├── courses/
│   └── {courseId}/
│       ├── courseName: string
│       ├── instructor: string
│       ├── category: string
│       ├── imageUrl: string
│       ├── rating: number (0-5)
│       ├── pricingType: "free"|"paid"
│       ├── price: number
│       ├── lectures: array
│       │   └── [0]:
│       │       ├── title: string
│       │       └── chapters: array
│       │           └── [0]:
│       │               ├── title: string
│       │               ├── videoUrl: string
│       │               └── duration: number
│       ├── totalLectures: number
│       ├── totalDuration: number
│       ├── totalEnrolled: number
│       ├── totalRevenue: number
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── enrollments/
│   └── {enrollmentId}/
│       ├── studentId: string
│       ├── courseId: string
│       ├── price: number
│       ├── enrollmentDate: timestamp
│       └── status: "enrolled"|"completed"|"dropped"
│
└── users/
    └── {userId}/
        ├── email: string
        ├── name: string
        ├── role: "admin"|"student"
        ├── photoURL: string
        └── progress/ (subcollection) [existing]
```

---

## 🚀 Performance Tips

1. **Minimize Firestore Reads:**
   - Cache course data locally
   - Use pagination for large datasets

2. **Image Optimization:**
   - Compress images before upload
   - Use recommended size: 1200x600px

3. **Real-time Updates:**
   - Consider adding Firestore listeners for live updates
   - Use `onSnapshot()` for real-time data

4. **Search Optimization:**
   - Client-side filtering (current approach)
   - Consider Algolia for full-text search

---

## 🐛 Debugging

### Common Issues

**Issue:** Can't access admin panel

```
Solution:
1. Check user has role: "admin" in Firestore
2. Verify Firebase authentication is working
3. Check console for auth errors
```

**Issue:** Courses won't save

```
Solution:
1. Check image upload succeeded
2. Verify form validation passes
3. Check Firestore rules allow writes
```

**Issue:** Enrollments show incorrect data

```
Solution:
1. Verify enrollments exist in Firestore
2. Check student IDs match users collection
3. Monitor/log getAllEnrollments() calls
```

---

## 📝 Example: Adding a Course Programmatically

```javascript
import { addCourse } from "./services/adminService";

const courseData = {
  courseName: "Advanced React",
  instructor: "Expert Dev",
  category: "programming",
  imageUrl: "https://storage.googleapis.com/...",
  rating: 4.8,
  pricingType: "paid",
  price: 79.99,
  lectures: [
    {
      title: "Advanced Patterns",
      chapters: [
        {
          title: "Render Props",
          videoUrl: "https://youtube.com/...",
          duration: 25,
        },
        {
          title: "Custom Hooks",
          videoUrl: "https://youtube.com/...",
          duration: 30,
        },
      ],
    },
  ],
};

const result = await addCourse(courseData);

if (result.success) {
  console.log("Course created:", result.courseId);
} else {
  console.error("Error:", result.error);
}
```

---

## 🔗 Related Files

- **Main Routing:** `src/App.jsx`
- **Admin Auth:** `src/hooks/useAdminAuth.jsx`
- **Global Auth:** `src/services/authService.js`
- **Student Dashboard:** `src/pages/Dashboard.jsx`
- **Firestore Rules:** `FIRESTORE_RULES.md`

---

## 📚 Next Steps

1. **Test the admin panel:**
   - Create a test course
   - Verify it appears in courses list
   - Check dashboard stats update

2. **Configure Firestore Rules:**
   - See `FIRESTORE_RULES.md` for admin-specific rules

3. **Customize:**
   - Add more course fields as needed
   - Customize analytics metrics
   - Add more category options

4. **Future Enhancements:**
   - Real-time updates with listeners
   - Bulk course import (CSV)
   - Advanced filtering and sorting
   - Email notifications
