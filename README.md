# Student Course Dashboard

A complete React application with Firebase Authentication and Firestore for tracking student course progress.

## Quick Start

```bash
# 1. Navigate to project
cd ~/downloads/lmt

# 2. Install dependencies
npm install

# 3. Create .env file (see .env.example)
cp .env.example .env

# 4. Add your Firebase credentials to .env

# 5. Start development server
npm run dev
```

## Features

- **Authentication**: Email/password signup & login with persistent sessions
- **Dashboard**: View all courses with progress bars
- **Course Detail**: View lessons and toggle completion status
- **Progress Tracking**: Real-time Firestore updates with progress calculation

## Project Structure

```
src/
  pages/
    Login.jsx         # Login/Signup page
    Dashboard.jsx     # Courses dashboard
    Course.jsx          # Individual course page
  components/
    CourseCard.jsx      # Course card with progress
    LessonItem.jsx      # Lesson with checkbox
  hooks/
    useAuth.js          # Auth context & hook
    useCourses.js       # Courses data hook
    useProgress.js      # Progress tracking hook
  services/
    firebase.js         # Firebase initialization
    authService.js      # Auth functions
    firestoreService.js # Firestore CRUD operations
```

## Firestore Data Model

### Collections

- **users** - User profiles
  - `userId`: { email, name }

- **courses** - Course content
  - `courseId`: { title, lessons: [{ id, title }] }

- **progress** - Completion tracking
  - `userId_courseId`: { userId, courseId, completedLessons: [] }

## License

MIT
