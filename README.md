# LMT – Learning Management Tool

A React + Firebase app for tracking student course progress. Students can browse courses, complete lessons, and monitor their learning progress in real-time.

[GitHub Repo](https://github.com/akhileshdasari2004/lmt) • [Setup Guide](#setup)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/akhileshdasari2004/lmt.git
cd lmt

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

## Features

- 📚 Browse available courses with detailed lesson lists
- ✅ Mark lessons as complete with instant progress tracking
- 📊 View real-time completion percentages per course
- 🔐 Secure authentication with Firebase
- 👤 User profile management with avatar support
- 🎨 Responsive design with Tailwind CSS
- 👨‍💼 Admin dashboard for course management

## Tech Stack

- **Frontend**: React 18 with Vite
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Project Structure

```
src/
  pages/
    Login.jsx              # Login/signup page
    Dashboard.jsx          # Student course dashboard
    Course.jsx             # Individual course view
    ProfilePage.jsx        # User profile management
    AdminDashboard.jsx     # Admin course management
    AdminLogin.jsx         # Admin login
  components/
    CourseCard.jsx         # Course card with progress
    LessonItem.jsx         # Lesson checkbox item
    Navbar.jsx             # Navigation bar
    common/
      Modal.jsx            # Reusable modal
      Toast.jsx            # Toast notifications
  hooks/
    useAuth.jsx            # Auth context & hook
    useCourses.jsx         # Courses data fetching
    useProgress.jsx        # Progress tracking
    useAdminAuth.jsx       # Admin authentication
    useAdminCourses.js     # Admin course management
  services/
    firebase.js            # Firebase initialization
    authService.js         # Authentication functions
    firestoreService.js    # Firestore CRUD operations
    courseService.js       # Course management
    adminCourseService.js  # Admin course operations
  styles/
    components.css         # Component semantic styles
```

## Firestore Data Model

### Collections

- **users** - User profiles
  - `userId`: { email, name, photoURL, role }
  - **progress** (subcollection) - Per-user course progress
    - `courseId`: { completedLessons: [] }

- **courses** - Course content
  - `courseId`: { title, description }
  - **lessons** (subcollection) - Course lessons
    - `lessonId`: { title, order }

## Development

### Seed Database

```bash
# Install dependencies and seed courses/users
node seed.js

# Reset database (danger: deletes all data)
node seed.js --reset
```

### Build for Production

```bash
npm run build
npm run preview
```

## Environment Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore, Authentication (Email/Password), and Storage
3. Copy your Firebase config to `src/services/firebase.js`
4. See [SETUP.md](SETUP.md) for detailed configuration

## Admin Access

To grant admin access to a user:

1. Navigate to `/admin/management` (requires existing admin account)
2. Enter the user email and click "Grant Admin Role"
3. Admin users can access `/admin` to manage courses and lessons

## License

MIT
