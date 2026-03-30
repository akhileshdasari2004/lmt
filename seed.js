import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Firebase config from .env
const firebaseConfig = {
  apiKey: "AIzaSyAHx_l6vPR-BN4i4YjVOqOOWcTtEpTiLwk",
  authDomain: "lmt1-7d997.firebaseapp.com",
  projectId: "lmt1-7d997",
  storageBucket: "lmt1-7d997.firebasestorage.app",
  messagingSenderId: "55016150672",
  appId: "1:55016150672:web:b406ca9888cc4fc53eea15"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const courses = [
  {
    id: "course1",
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming",
    lessons: [
      { title: "Variables and Data Types", content: "Learn about const, let, var and different data types in JavaScript" },
      { title: "Functions and Scope", content: "Understanding function declarations, expressions, and lexical scope" },
      { title: "DOM Manipulation", content: "How to select and modify HTML elements with JavaScript" },
      { title: "Events and Callbacks", content: "Event handling and callback functions in JavaScript" }
    ]
  },
  {
    id: "course2",
    title: "React Fundamentals",
    description: "Master the basics of React framework",
    lessons: [
      { title: "JSX and Components", content: "Understanding JSX syntax and React components" },
      { title: "Props and State", content: "Learn how to pass data with props and manage state" },
      { title: "useEffect Hook", content: "Side effects and lifecycle management with useEffect" },
      { title: "React Router", content: "Client-side routing with React Router" },
      { title: "Context API", content: "State management with React Context API" }
    ]
  },
  {
    id: "course3",
    title: "Firebase for Beginners",
    description: "Get started with Firebase services",
    lessons: [
      { title: "Firebase Setup", content: "How to set up a Firebase project and configure your app" },
      { title: "Firestore Basics", content: "Understanding Firestore database structure and queries" },
      { title: "Firebase Authentication", content: "Implement user authentication with Firebase Auth" }
    ]
  }
];

async function seed() {
  console.log("Seeding courses with subcollection structure...\n");

  for (const course of courses) {
    const { id, lessons, ...courseData } = course;

    // Create course document
    await setDoc(doc(db, "courses", id), {
      ...courseData,
      lessonCount: lessons.length,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log(`✅ Created course: ${courseData.title}`);

    // Create lessons as subcollection
    const lessonsRef = collection(db, "courses", id, "lessons");
    for (let i = 0; i < lessons.length; i++) {
      await addDoc(lessonsRef, {
        ...lessons[i],
        order: i,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    console.log(`   📚 Added ${lessons.length} lessons`);
  }

  console.log("\n🎉 All courses and lessons seeded!");
  console.log("\nNext steps:");
  console.log("1. Update Firestore security rules (see FIRESTORE_RULES.md)");
  console.log("2. Refresh your app to see the courses");
  process.exit(0);
}

seed().catch(console.error);
