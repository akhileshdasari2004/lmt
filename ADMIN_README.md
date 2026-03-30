# Course & Lesson Management System - Admin Features

## Overview

Complete CRUD implementation for managing courses and lessons with Firebase Firestore subcollections.

## Data Model

### Firestore Structure

```
courses/{courseId}                    - Course document
  ├── title: string
  ├── description: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  └── lessonCount: number

courses/{courseId}/lessons/{lessonId} - Lessons subcollection
  ├── title: string
  ├── content: string
  ├── order: number
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### Why Subcollections?

- **Scalability**: No 1MB document limit per course
- **Individual Access**: Fetch/modify single lessons without loading entire course
- **Ordering**: Native support for ordered queries
- **Security**: Fine-grained security rules per subcollection

## New Files Created

### Services
- `src/services/adminCourseService.js` - Complete CRUD operations

### Hooks
- `src/hooks/useAdminCourses.js` - Course management hook
- `src/hooks/useAdminLessons.js` - Lesson management hook

### Components (Admin)
- `src/components/admin/CourseForm.jsx` - Create/Edit course form
- `src/components/admin/CourseList.jsx` - Course list with actions
- `src/components/admin/LessonForm.jsx` - Create/Edit lesson form
- `src/components/admin/LessonList.jsx` - Drag-drop sortable lesson list

### Pages
- `src/pages/AdminDashboard.jsx` - Admin home (course management)
- `src/pages/CourseManage.jsx` - Course detail + lesson management

### Documentation
- `FIRESTORE_RULES.md` - Security rules

## Features

### Course Management
- ✅ Create courses with title and description
- ✅ Edit course details
- ✅ Delete courses (with all lessons)
- ✅ View all courses with metadata

### Lesson Management
- ✅ Add lessons to courses
- ✅ Edit lesson content
- ✅ Delete lessons (with automatic reordering)
- ✅ Drag & drop reordering
- ✅ Bulk lesson creation

### UI/UX
- ✅ Loading states on all actions
- ✅ Toast notifications for success/error
- ✅ Confirmation before delete
- ✅ Inline editing for lessons
- ✅ Drag handles for reordering

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/admin` | AdminDashboard | List all courses, create/edit |
| `/admin/courses/:id` | CourseManage | Course details + lesson management |

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# Already includes @hello-pangea/dnd for drag-drop
```

### 2. Update Firestore Rules

Go to Firebase Console > Firestore Database > Rules, paste rules from `FIRESTORE_RULES.md`

### 3. Seed Test Data (Optional)

```bash
node seed.js
```

This creates courses with lessons in the new subcollection format.

### 4. Run the App

```bash
npm run dev
```

### 5. Access Admin Panel

1. Log in as any user
2. Click "Admin" in the top navigation bar
3. Start managing courses!

## Security Considerations

Current rules allow any authenticated user to CRUD courses. For production:

1. Add an `admins` collection
2. Update rules to check admin status before allowing writes
3. See `FIRESTORE_RULES.md` for example

## Architecture Decisions

### Service Layer Pattern
- All Firestore operations isolated in `adminCourseService.js`
- Hooks use services, components use hooks
- Clean separation of concerns

### Optimistic Updates
- Local state updates immediately
- Firestore syncs in background
- Error handling with rollback

### Batch Operations
- Delete course + lessons in single batch
- Reorder lessons with batch write
- Atomic operations for data integrity

## Future Enhancements

- [ ] Rich text editor for lesson content
- [ ] Image upload for course/lesson media
- [ ] Course publishing workflow (draft/published)
- [ ] Lesson preview mode
- [ ] Course duplication
- [ ] Import/export courses (JSON)
