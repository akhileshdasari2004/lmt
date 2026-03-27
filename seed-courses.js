// Firestore Seed Script
// Run with: node seed-courses.js
// Requires: npm install firebase-admin

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with your service account
// Download service account from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const courses = [
  {
    id: 'course1',
    title: 'Introduction to JavaScript',
    lessons: [
      { id: 'l1', title: 'Variables and Data Types' },
      { id: 'l2', title: 'Functions and Scope' },
      { id: 'l3', title: 'DOM Manipulation' },
      { id: 'l4', title: 'Events and Callbacks' }
    ]
  },
  {
    id: 'course2',
    title: 'React Fundamentals',
    lessons: [
      { id: 'l1', title: 'JSX and Components' },
      { id: 'l2', title: 'Props and State' },
      { id: 'l3', title: 'useEffect Hook' },
      { id: 'l4', title: 'React Router' },
      { id: 'l5', title: 'Context API' }
    ]
  },
  {
    id: 'course3',
    title: 'Firebase for Beginners',
    lessons: [
      { id: 'l1', title: 'Firebase Setup' },
      { id: 'l2', title: 'Firestore Basics' },
      { id: 'l3', title: 'Firebase Authentication' }
    ]
  }
];

async function seedCourses() {
  console.log('Seeding courses...\n');

  for (const course of courses) {
    try {
      await db.collection('courses').doc(course.id).set({
        title: course.title,
        lessons: course.lessons
      });
      console.log(`✓ Added: ${course.title} (${course.lessons.length} lessons)`);
    } catch (error) {
      console.error(`✗ Error adding ${course.title}:`, error.message);
    }
  }

  console.log('\n✓ Seeding complete!');
  process.exit(0);
}

seedCourses().catch(error => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
