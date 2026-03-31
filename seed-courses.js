#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('Error: serviceAccountKey.json not found in project root.');
  console.error('Create it from Firebase Console > Project settings > Service accounts.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

const COURSES = [
  {
    id: 'course1',
    title: 'Introduction to JavaScript',
    description: 'Learn the fundamentals of JavaScript programming',
    lessons: [
      { title: 'Variables and Data Types', description: 'Intro to JS data types' },
      { title: 'Functions and Scope', description: 'Functions and lexical scope' },
      { title: 'DOM Manipulation', description: 'Working with HTML elements' },
    ],
  },
  {
    id: 'course2',
    title: 'React Fundamentals',
    description: 'Master the basics of React framework',
    lessons: [
      { title: 'Components and JSX', description: 'Understanding JSX and components' },
      { title: 'Props and State', description: 'Managing data flow in React' },
      { title: 'useEffect Hook', description: 'Lifecycle and side effects' },
      { title: 'Context API', description: 'Global state with context' },
    ],
  },
  {
    id: 'course3',
    title: 'Firebase for Beginners',
    description: 'Get started with Firebase services',
    lessons: [
      { title: 'Firebase Setup', description: 'Setup and initialization' },
      { title: 'Firestore Basics', description: 'Collections and documents' },
      { title: 'Firebase Authentication', description: 'Auth with Email/Password' },
    ],
  },
];

async function seedCourses() {
  console.log('Seeding courses collection...');
  for (const course of COURSES) {
    await db.collection('courses').doc(course.id).set({
      title: course.title,
      description: course.description,
      lessonCount: course.lessons.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const lessonsRef = db.collection('courses').doc(course.id).collection('lessons');
    for (let i = 0; i < course.lessons.length; i += 1) {
      await lessonsRef.add({
        title: course.lessons[i].title,
        description: course.lessons[i].description,
        order: i,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`Seeded ${course.title}`);
  }
}

seedCourses()
  .then(() => {
    console.log('Course seeding complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Course seeding failed:', err.message);
    process.exit(1);
  });
