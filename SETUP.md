# Student Course Dashboard - Complete Setup Guide

## 1. Vite Project Setup

### Create Project
```bash
# Create Vite project with React
cd ~/downloads/lmt

# Install dependencies
npm install
```

### Development Commands
```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 2. Firebase Setup (Step-by-Step)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "student-dashboard")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Select **Email/Password** provider
4. Enable "Email/Password" (keep "Email link" disabled)
5. Click "Save"

### Step 3: Enable Firestore
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select **Start in test mode** (allows reads/writes for 30 days)
4. Choose location closest to your users
5. Click "Enable"

### Step 4: Get Firebase Config
1. Click the **</>** icon to add a web app
2. Enter app nickname (e.g., "student-dashboard-web")
3. Click "Register app"
4. Copy the config object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## 3. Environment Variables (.env)

Create `.env` file in project root:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Important:**
- Variables must start with `VITE_` to be accessible in client code
- Never commit `.env` to version control

---

## 4. Sample Firestore Data

### Import to Firestore (Manual)

In Firebase Console > Firestore Database:

**Collection: users** (auto-created on signup)
```json
{
  "userId": "auto-generated",
  "email": "student@example.com",
  "name": "John Doe"
}
```

**Collection: courses** (manual entry required)

Create document with ID: `course-1`
```json
{
  "title": "Introduction to React",
  "lessons": [
    { "id": "lesson-1", "title": "What is React?" },
    { "id": "lesson-2", "title": "Setting up your environment" },
    { "id": "lesson-3", "title": "JSX Basics" },
    { "id": "lesson-4", "title": "Components and Props" },
    { "id": "lesson-5", "title": "State and Lifecycle" }
  ]
}
```

Create document with ID: `course-2`
```json
{
  "title": "Firebase Fundamentals",
  "lessons": [
    { "id": "lesson-1", "title": "Firebase Overview" },
    { "id": "lesson-2", "title": "Authentication" },
    { "id": "lesson-3", "title": "Cloud Firestore" },
    { "id": "lesson-4", "title": "Security Rules" }
  ]
}
```

Create document with ID: `course-3`
```json
{
  "title": "Tailwind CSS Mastery",
  "lessons": [
    { "id": "lesson-1", "title": "Utility First CSS" },
    { "id": "lesson-2", "title": "Responsive Design" },
    { "id": "lesson-3", "title": "Flexbox and Grid" },
    { "id": "lesson-4", "title": "Custom Components" },
    { "id": "lesson-5", "title": "Dark Mode" },
    { "id": "lesson-6", "title": "Animations" }
  ]
}
```

**Collection: progress** (auto-created by app)
- Document ID format: `userId_courseId`
- Created automatically when user marks lessons complete

---

## 5. Security Rules (Firestore)

Go to Firebase Console > Firestore Database > Rules

Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to read courses
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admin writes
    }

    // Allow users to read/write their own progress
    match /progress/{progressId} {
      allow read, write: if request.auth != null &&
        progressId.matches(request.auth.uid + '_.*');
    }
  }
}
```

Click "Publish" to save rules.

---

## 6. Running the Application

### Development Mode
```bash
npm run dev
# Open http://localhost:5173
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 7. Testing the App

1. **Sign Up**: Create a new account on the login page
2. **View Dashboard**: See courses with 0% progress
3. **Open Course**: Click on any course card
4. **Mark Complete**: Check boxes on lessons
5. **Watch Progress**: Dashboard updates with progress bars
6. **Logout**: Click logout button to end session

---

## Troubleshooting

### "Firebase config not found"
- Ensure `.env` file exists
- Check all variables start with `VITE_`
- Restart dev server after adding env variables

### "Permission denied" errors
- Check Firestore security rules are published
- Verify user is authenticated

### "Module not found"
- Run `npm install` again
- Check all imports match file paths exactly

### Styles not loading
- Ensure Tailwind CSS classes are correct
- Check `index.css` imports Tailwind directives

---

## File Structure Summary

```
~/downloads/lmt/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env                      # Create this (not committed)
├── .env.example              # Template for env vars
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Course.jsx
│   ├── components/
│   │   ├── CourseCard.jsx
│   │   └── LessonItem.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCourses.js
│   │   └── useProgress.js
│   └── services/
│       ├── firebase.js
│       ├── authService.js
│       └── firestoreService.js
└── README.md
```

---

**All code is complete and ready to run!**
