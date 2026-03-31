# Firestore Security Rules

Apply these rules in your Firebase Console (Firestore Database > Rules):

## Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write own doc. Admin can read all.
    match /users/{userId} {
      allow read: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());
      allow write: if request.auth != null &&
        request.auth.uid == userId;
      allow update: if isAdmin();
    }

    // Courses — anyone logged in can read, only admin writes
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // Lesson requests — student creates own, admin reads all
    match /lessonRequests/{requestId} {
      allow create: if request.auth != null &&
        request.resource.data.studentId == request.auth.uid;
      allow read, update: if request.auth != null &&
        (resource.data.studentId == request.auth.uid || isAdmin());
    }

    // Assignments — student reads own, only admin writes
    match /assignments/{studentId} {
      allow read: if request.auth != null &&
        (request.auth.uid == studentId || isAdmin());
      allow write: if isAdmin();
    }

    // Progress — student reads/writes own only
    match /progress/{docId} {
      allow read, write: if request.auth != null &&
        docId.matches(request.auth.uid + '_.*');
    }

    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid))
          .data.role == 'admin';
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
