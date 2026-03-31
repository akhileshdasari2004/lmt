# Admin Lessons Management Guide

## Overview

Admins can now fully manage courses and lessons. When a lesson is added to a course by the admin, it **automatically appears** in the student dashboard and course pages.

## Step-by-Step: Adding Lessons to a Course

### Step 1: Go to Courses Management

1. Log in as admin
2. Click **"Courses"** in the sidebar
3. You'll see all courses with three action buttons: **Manage**, **Edit**, **Delete**

### Step 2: Click "Manage" to Access Lesson Management

1. Find the course you want to add lessons to
2. Click the **"Manage"** button (green button)
3. You'll be taken to the Course Management page with two tabs: **Details** and **Lessons**

### Step 3: Go to "Lessons" Tab

1. Click the **"Lessons"** tab
2. You'll see an "Add New Lesson" form at the top
3. Below that is a list of existing lessons (if any)

### Step 4: Add a New Lesson

1. Enter the **Lesson Title** (required)
   - Example: "Introduction to React Hooks"
2. Enter **Content** (optional)
   - Add lesson description or notes
3. Click **"Add Lesson"** button
4. The lesson will appear in the lessons list below

### Step 5: Manage Lessons

- **Edit**: Click "Edit" on any lesson to modify its title or content
- **Delete**: Click "Delete" to remove a lesson
- **Reorder**: Drag lessons up/down to change their order (students will see them in this order)

## How Students See Lessons

### On Student Dashboard

1. Students see all courses as cards
2. Each card shows the course title, number of lessons, and progress percentage
3. Progress updates as students check off completed lessons

### When Student Opens a Course

1. Student sees the course title and overall progress bar
2. Below that is the list of **all lessons added by the admin**
3. Each lesson can be checked off as complete
4. Progress percentage updates in real-time

## Important Notes

### Real-Time Sync

- When you add a lesson, students see it **immediately** (no page refresh needed on their end for new lessons to appear)
- When you delete a lesson, it's removed from all students' views
- When you reorder lessons, students see the new order next time they load the course

### Progress Tracking

- Student progress is **NOT** reset when you add/remove lessons
- If a student already checked off lessons, that progress stays intact
- Deleted lessons no longer contribute to progress calculations

### Lesson Data Stored

In Firestore, lessons are stored at:

```
/courses/{courseId}/lessons/{lessonId}
```

Each lesson contains:

- `title` - Lesson name
- `content` - Lesson description/notes
- `order` - Display order (0-based index)
- `createdAt` - When lesson was created
- `updatedAt` - When lesson was last modified

## Troubleshooting

### Issue: Lessons not showing to students

1. Verify the lesson was saved (should appear in the lessons list)
2. Check Firestore console: go to `courses/{courseId}/lessons` collection
3. Verify students have internet connection and can load courses
4. Have students do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Changes not appearing immediately

1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache in DevTools (F12 → Application → Cache Storage → Clear)
3. Try in an incognito/private window

### Issue: "Missing or insufficient permissions" error

1. Check Firestore Rules in Firebase Console
2. Verify the rules allow authenticated users to write to courses/lessons
3. Reference: FIRESTORE_RULES.md for correct rules

## Admin Actions Cheat Sheet

| Action              | Path                             | Button                |
| ------------------- | -------------------------------- | --------------------- |
| View all courses    | `/admin/courses`                 | In sidebar            |
| Manage lessons      | `/admin/courses/{courseId}`      | Green "Manage" button |
| Edit course details | `/admin/courses/edit/{courseId}` | Blue "Edit" button    |
| Delete course       | `/admin/courses`                 | Red "Delete" button   |
| Create new course   | `/admin/courses/new`             | "+ New Course" button |

## Video Walkthrough (If Available)

Steps 1-4 can be completed in about 1-2 minutes per lesson.

## Contact Support

If you encounter any issues adding or managing lessons, check:

1. Browser console (F12) for error messages
2. Firestore console for database structure
3. Verify proper Firestore security rules are applied
