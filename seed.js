import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

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
    lessons: [
      { id: "l1", title: "Variables and Data Types" },
      { id: "l2", title: "Functions and Scope" },
      { id: "l3", title: "DOM Manipulation" },
      { id: "l4", title: "Events and Callbacks" }
    ]
  },
  {
    id: "course2",
    title: "React Fundamentals",
    lessons: [
      { id: "l1", title: "JSX and Components" },
      { id: "l2", title: "Props and State" },
      { id: "l3", title: "useEffect Hook" },
      { id: "l4", title: "React Router" },
      { id: "l5", title: "Context API" }
    ]
  },
  {
    id: "course3",
    title: "Firebase for Beginners",
    lessons: [
      { id: "l1", title: "Firebase Setup" },
      { id: "l2", title: "Firestore Basics" },
      { id: "l3", title: "Firebase Authentication" }
    ]
  }
];

async function seed() {
  console.log("Seeding courses...\n");
  for (const course of courses) {
    const { id, ...data } = course;
    await setDoc(doc(db, "courses", id), data);
    console.log(`✅ Added: ${data.title}`);
  }
  console.log("\n🎉 All courses seeded!");
  process.exit(0);
}

seed().catch(console.error);
