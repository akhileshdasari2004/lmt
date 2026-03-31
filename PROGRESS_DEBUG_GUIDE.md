# Student Dashboard Progress Debugging Guide

## Issues Fixed

1. **Enhanced error handling** - Added error states to track progress fetching issues
2. **Improved logging** - Added detailed console logging to trace progress updates
3. **Real-time state updates** - Fixed potential timing issues with async progress updates
4. **Component unmount safety** - Added `isMountedRef` to prevent state updates on unmounted components
5. **Dashboard progress refresh** - Added proper cleanup and re-initialization of progress hooks

## Debugging Steps

### 1. Check Browser Console (F12)

Open DevTools and look for these error messages:

```
- "Error fetching progress:" - Firestore read permission issue
- "Error toggling lesson:" - Firestore write permission issue
- "Missing userId or courseId" - Authentication not fully loaded
- Progress calculation logs - Should show current/total lessons
```

### 2. Verify Firestore Security Rules

Go to Firebase Console > Firestore > Rules and check this path:

```
allow read, write: if request.auth.uid == userId;
```

The progress documents should be readable/writable by the authenticated user.

### 3. Check Firestore Data Structure

**Expected path:**

```
/users/{userId}/progress/{courseId}
  - completedLessons: [] (array of lesson IDs)
  - updatedAt: timestamp
  - courseId: string
```

### 4. Verify User is Logged In

The dashboard requires authentication:

- Check if user profile appears in top navigation
- Verify `useAuth()` returns a user object with `uid`
- If user is null, the progress hook won't initialize

### 5. Test Progress Toggle

1. Navigate to a course
2. Check the browser console for: `"Toggling lesson {lessonId}"`
3. Check the response: `"Updated completed lessons: [...]"`
4. Verify Firestore shows the update in the console

### 6. Check Progress Calculations

The progress bar formula:

```
percent = Math.round((completedLessons.length / totalLessons.length) * 100)
```

- If showing 0% with completed lessons, check if `calculateProgress()` is receiving the correct lessons array
- If lessons property is undefined, lessons won't load from subcollection

## Common Issues & Solutions

### Issue: Progress shows 0% even after marking lessons complete

**Possible causes:**

1. `course.lessons` is undefined or empty
2. `progress.completedLessons` isn't updating after toggle
3. Data not persisting to Firestore

**Solution:**

1. Check browser console for logs during lesson toggle
2. Verify Firestore has the progress document with updated completedLessons
3. Check Firestore security rules allow write access

### Issue: Dashboard shows "Loading..." indefinitely

**Possible causes:**

1. User not authenticated (userId is null/undefined)
2. Firestore database unreachable
3. CORS or network issue

**Solution:**

1. Verify user is logged in
2. Check browser Network tab for Firestore requests
3. Verify Firebase credentials in .env.local

### Issue: Lesson checkboxes don't respond when clicked

**Possible causes:**

1. `onToggle` callback not properly passed
2. Progress hook not initialized with proper userId/courseId
3. Firestore write permissions denied

**Solution:**

1. Check console for `"Toggling lesson"` log
2. Verify user has write permissions to `/users/{uid}/progress/{courseId}`
3. Check for error messages in Firestore rules

## Testing Checklist

- [ ] User logs in successfully
- [ ] Dashboard loads and shows courses
- [ ] Initial progress is 0% for new courses
- [ ] Can mark a lesson as complete (checkbox changes, green badge appears)
- [ ] Progress bar updates after toggling
- [ ] Page refresh shows persistent progress
- [ ] Can toggle lesson completion multiple times
- [ ] Progress updates in real-time without page refresh
- [ ] Navigating between dashboard and course pages keeps progress in sync

## Console Logging Guide

Open DevTools Console (F12) and look for progress-related logs:

```javascript
// When loading dashboard
"Dashboard mounted/updated. User: {userId}";

// When fetching course progress
"Fetching progress for user: {userId}, course: {courseId}";
"Progress data fetched: {...}";

// When toggling lesson
"Toggling lesson {lessonId} for user {userId} in course {courseId}";
"Updated completed lessons: [...]";

// Progress calculations
"Progress calculation: {completed}/{total} = {percent}%";
```

## Common Error Messages

| Error                        | Cause                               | Solution                             |
| ---------------------------- | ----------------------------------- | ------------------------------------ |
| `permission-denied`          | User doesn't have Firestore access  | Check Firebase rules                 |
| `missing userId or courseId` | Authentication not ready            | Ensure user is logged in             |
| `Failed to fetch progress`   | Network/database issue              | Check Firebase connectivity          |
| `Lessons not found`          | Course has no lessons subcollection | Verify course structure in Firestore |

## Firestore Rules Template

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;

      // Progress subcollection
      match /progress/{courseId} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Courses collection (public read)
    match /courses/{courseId} {
      allow read: if true;

      // Lessons subcollection
      match /lessons/{lessonId} {
        allow read: if true;
      }
    }
  }
}
```

## Next Steps

1. Open browser DevTools (F12) and navigate to Dashboard
2. Check Console tab for any errors
3. Look for progress-related logs
4. Try toggling a lesson and watch console output
5. Verify Firestore document updates in real-time
6. Report the specific error or behavior from console
