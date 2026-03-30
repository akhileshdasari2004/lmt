# Firestore Security Rules

Apply these rules in your Firebase Console (Firestore Database > Rules):

## Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Courses collection - anyone can read, only authenticated users can write (admin)
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Lessons subcollection - anyone can read, only authenticated users can write
    match /courses/{courseId}/lessons/{lessonId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Progress collection - users can only read/write their own progress
    match /progress/{progressId} {
      allow read, write: if request.auth != null;
    }

    // Users collection
    match /users/{userId} {
      // Users can always read/write their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Storage Rules

Apply these rules in your Firebase Console (Storage > Rules):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Note

These rules allow any authenticated user to create/edit courses. For production, you should implement admin role checking:

```javascript
// Example with admin check
function isAdmin() {
  return request.auth != null &&
         exists(/databases/$(database)/documents/admins/$(request.auth.uid));
}

match /courses/{courseId} {
  allow read: if request.auth != null;
  allow write: if isAdmin();  // Only admins can write
}
```
