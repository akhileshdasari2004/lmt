# Admin Panel Module Documentation

## Overview

The Admin Panel is a comprehensive management system for course administrators. It provides dashboard analytics, course management, and enrollment tracking.

## Features Implemented

### 1. Admin Access Control ✅

**Routing Structure:**

- Protected admin routes: `/admin/dashboard`, `/admin/courses`, `/admin/bookings`
- Authentication via Firebase with role-based access
- Only users with `role: "admin"` in Firestore can access
- Auto-redirect to `/admin/login` for non-authenticated users

**Key Files:**

- `src/hooks/useAdminAuth.jsx` - Admin authentication context
- `src/services/authService.js` - Firebase authentication functions

### 2. Performance Dashboard ✅

**Location:** `/admin/dashboard`

**Components:**

- **Stats Cards:** Display key metrics
  - Total Courses
  - Total Enrollments
  - Total Revenue
  - Enrollments (last 7 days)
- **Course Analytics Table:** Shows performance data
  - Course Name, Instructor, Price
  - Total Students Enrolled
  - Total Earnings

**Features:**

- Real-time data fetching from Firestore
- Auto-calculation of statistics
- Responsive grid layout

**Files:**

- `src/pages/AdminDashboardNew.jsx`
- `src/components/admin/StatsCard.jsx`
- `src/components/admin/CourseAnalyticsTable.jsx`

### 3. Course Management System ✅

**Location:** `/admin/courses`

**Core Features:**

#### A. Course Creation Form (`/admin/courses/new`)

Fields:

- Course Name
- Instructor Name
- Category (dropdown)
- Rating (0-5)
- Pricing Type (Free/Paid)
- Price (if paid)
- Course Image (with preview)

#### B. Nested Content Structure

Each course can have:

- **Lectures** (array)
  - Lecture Title
  - **Chapters** (array per lecture)
    - Chapter Title
    - Video URL (optional)
    - Duration (in minutes)

#### C. Auto-Calculations

- `totalLectures` = number of lectures
- `totalDuration` = sum of all chapter durations
- Computed before saving to Firestore

#### D. Course Listing Page

Features:

- Table view of all courses
- Search/filter by name, instructor, or category
- Sort by creation date
- Display: name, instructor, price, total students
- Actions: Edit, Delete

#### E. Course Deletion

- Deletes course document
- Deletes all associated enrollments
- Deletes image from Firebase Storage

**Components:**

- `src/pages/AdminCoursesPage.jsx` - Main courses listing
- `src/pages/AdminCourseForm.jsx` - Enhanced course form
- `src/components/admin/LectureBuilder.jsx` - Lecture/chapter builder
- `src/components/admin/CourseAnalyticsTable.jsx` - Analytics table

**Firestore Structure:**

```
courses/
  {courseId}/
    courseName: string
    instructor: string
    category: string
    imageUrl: string
    rating: number
    pricingType: "free" | "paid"
    price: number
    lectures: [
      {
        title: string
        chapters: [
          {
            title: string
            videoUrl: string
            duration: number
          }
        ]
      }
    ]
    totalLectures: number
    totalDuration: number
    totalEnrolled: number
    totalRevenue: number
    createdAt: timestamp
    updatedAt: timestamp
```

### 4. Booking/Enrollment Management ✅

**Location:** `/admin/bookings`

**Features:**

- Display all enrollments/bookings
- Filter by student name or course name
- Sort by date, student, or course
- Summary stats:
  - Total Enrollments
  - Total Revenue
  - Average Price per Enrollment

**Components:**

- `src/pages/AdminBookingsPage.jsx`
- `src/components/admin/CourseEnrollmentTable.jsx`

**Firestore Structure:**

```
enrollments/
  {enrollmentId}/
    studentId: string
    courseId: string
    price: number
    enrollmentDate: timestamp
    status: "enrolled" | "completed" | "dropped"
```

### 5. Firebase Integration ✅

**Services Implemented:**

#### adminService.js

**Course Operations:**

- `addCourse(courseData)` - Create new course
- `updateCourseAdmin(courseId, courseData)` - Update course
- `getCourseForAdmin(courseId)` - Fetch single course
- `getAllCoursesForAdmin()` - Fetch all courses
- `deleteCourseAdmin(courseId, imageUrl)` - Delete course and image

**Enrollment Operations:**

- `getAllEnrollments()` - Fetch all enrollments
- `createEnrollment(studentId, courseId, price)` - Create enrollment

**Analytics:**

- `getDashboardStats()` - Get dashboard statistics
- `getCourseAnalytics()` - Get course performance data
- `searchCourses(searchTerm)` - Search courses

**Key Features:**

- Auto-calculation of totals before saving
- Batch operations for efficient deletes
- Firebase Storage integration for images
- Error handling and logging

### 6. UI/UX Implementation ✅

**Admin Layout:**

- Responsive sidebar navigation
- Dark theme (gray-900 background)
- Tailwind CSS styling

**Components:**

- `AdminSidebar.jsx` - Main navigation
- `StatsCard.jsx` - Stat display cards
- `LectureBuilder.jsx` - Interactive lecture builder
- `CourseAnalyticsTable.jsx` - Analytics table
- `CourseEnrollmentTable.jsx` - Enrollment table

**Design Patterns:**

- Consistent spacing and sizing
- Red accent color for CTAs
- Hover effects and transitions
- Loading states with spinners
- Toast notifications for feedback

### 7. Code Structure ✅

```
src/
├── services/
│   ├── adminService.js          # Central admin service
│   └── storageService.js        # Firebase Storage
│
├── hooks/
│   └── useAdminOperations.js    # Admin operations hook
│
├── components/admin/
│   ├── AdminSidebar.jsx         # Navigation sidebar
│   ├── StatsCard.jsx            # Stats display
│   ├── LectureBuilder.jsx       # Lecture builder
│   ├── CourseAnalyticsTable.jsx # Analytics table
│   └── CourseEnrollmentTable.jsx# Enrollment table
│
├── pages/
│   ├── AdminDashboardNew.jsx    # Performance dashboard
│   ├── AdminCoursesPage.jsx     # Course listing
│   ├── AdminCourseForm.jsx      # Course form (create/edit)
│   └── AdminBookingsPage.jsx    # Enrollment listing
│
└── App.jsx                      # Updated routing
```

## Usage Guide

### Accessing Admin Panel

1. **Login as Admin:**

   ```
   URL: /admin/login
   Credentials: admin@example.com (from seed data)
   ```

2. **Navigation:**
   - Dashboard: `/admin/dashboard`
   - Courses: `/admin/courses`
   - Bookings: `/admin/bookings`

### Creating a Course

1. Navigate to `/admin/courses`
2. Click "+ New Course"
3. Fill in course details:
   - Name, Instructor, Category
   - Set pricing (Free or Paid)
   - Upload course image
4. Add Lectures:
   - Click "+ Add Lecture"
   - Enter lecture title
   - Add chapters with videos and durations
5. Click "Create Course"

### Managing Courses

- **Search:** Use search bar to find courses
- **Edit:** Click "Edit" to modify course details
- **Delete:** Click "Delete" to remove (also deletes image and enrollments)

### Viewing Analytics

**Dashboard (/admin/dashboard):**

- View key performance metrics
- See course performance table
- Track revenue and enrollments

**Bookings (/admin/bookings):**

- View all enrollments
- Filter and sort enrollments
- Track revenue per enrollment

## API Reference

### Admin Service Functions

#### Courses

```javascript
// Create course
const result = await addCourse({
  courseName: "React 101",
  instructor: "John Doe",
  category: "programming",
  imageUrl: "...",
  rating: 4.5,
  pricingType: "paid",
  price: 29.99,
  lectures: [...]
});

// Update course
await updateCourseAdmin(courseId, courseData);

// Get course
const course = await getCourseForAdmin(courseId);

// Get all courses
const courses = await getAllCoursesForAdmin();

// Delete course
await deleteCourseAdmin(courseId, imageUrl);
```

#### Enrollments

```javascript
// Get all enrollments
const enrollments = await getAllEnrollments();

// Create enrollment
await createEnrollment(studentId, courseId, price);
```

#### Analytics

```javascript
// Get dashboard stats
const stats = await getDashboardStats();
// Returns: { totalCourses, totalEnrollments, totalRevenue, enrollmentsLast7Days }

// Get course analytics
const analytics = await getCourseAnalytics();
```

## Security

1. **Authentication:** Firebase Auth with admin role checking
2. **Authorization:** Role-based access control via Firestore
3. **Data Validation:** Input validation on forms
4. **Image Security:** Secure Firebase Storage upload/delete

## Performance Optimizations

1. **Batch Operations:** Use `writeBatch` for multiple deletions
2. **Lazy Loading:** Component-level data fetching
3. **Memoization:** useCallback hooks for expensive operations
4. **Indexed Queries:** Firestore queries optimized with indexes

## Known Limitations

1. Firestore aggregation limited to 100 documents per read
2. File uploads limited by Firebase Storage
3. Real-time updates require Firestore listeners (future enhancement)

## Future Enhancements

1. Real-time updates using Firestore listeners
2. Bulk import/export of courses (CSV)
3. Advanced analytics and charts
4. Student progress tracking
5. Email notifications for enrollments
6. Content recommendation engine
7. Video processing and optimization
8. Mobile app admin panel
