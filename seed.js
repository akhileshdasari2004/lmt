#!/usr/bin/env node

/**
 * Database Seed Script
 *
 * Usage:
 *   node seed.js          - Seed courses and users
 *   node seed.js --reset  - DELETE ALL DATA, then reseed (use with caution!)
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const path = require("path");

// Check for service account key
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
let serviceAccount;

try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error("❌ Error: serviceAccountKey.json not found in project root\n");
  console.error("To set up seeding:");
  console.error(
    "1. Go to Firebase Console → Project Settings → Service Accounts",
  );
  console.error("2. Click 'Generate New Private Key'");
  console.error("3. Save as serviceAccountKey.json\n");
  process.exit(1);
}

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

// ============================================================================
// SEED DATA
// ============================================================================

const USERS = [
  {
    uid: "admin1",
    email: "admin@example.com",
    name: "Jane Admin",
    role: "admin",
  },
  {
    uid: "student1",
    email: "student@example.com",
    name: "John Student",
    role: "student",
  },
];

const COURSES = [
  {
    id: "course1",
    title: "Introduction to JavaScript",
    description: "Learn the fundamentals of JavaScript programming",
    lessons: [
      {
        title: "Variables and Data Types",
        description:
          "Learn about const, let, var and different data types in JavaScript",
      },
      {
        title: "Functions and Scope",
        description:
          "Understanding function declarations, expressions, and lexical scope",
      },
      {
        title: "DOM Manipulation",
        description: "How to select and modify HTML elements with JavaScript",
      },
    ],
  },
  {
    id: "course2",
    title: "React Fundamentals",
    description: "Master the basics of React framework",
    lessons: [
      {
        title: "Components and JSX",
        description: "Understanding JSX syntax and React components",
      },
      {
        title: "Props and State",
        description: "Learn how to pass data with props and manage state",
      },
      {
        title: "useEffect Hook",
        description: "Side effects and lifecycle management with useEffect",
      },
      {
        title: "Context API",
        description: "State management with React Context API",
      },
    ],
  },
  {
    id: "course3",
    title: "Firebase for Beginners",
    description: "Get started with Firebase services",
    lessons: [
      {
        title: "Firebase Setup",
        description: "How to set up a Firebase project and configure your app",
      },
      {
        title: "Firestore Basics",
        description: "Understanding Firestore database structure and queries",
      },
      {
        title: "Firebase Authentication",
        description: "Implement user authentication with Firebase Auth",
      },
    ],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function deleteAllData() {
  console.log("🗑️  Deleting all data...\n");

  // Delete all users
  const usersSnap = await db.collection("users").get();
  for (const doc of usersSnap.docs) {
    const sub = await db
      .collection("users")
      .doc(doc.id)
      .collection("progress")
      .get();
    for (const subDoc of sub.docs) {
      await subDoc.ref.delete();
    }
    await doc.ref.delete();
  }
  console.log(`   ✓ Deleted users and progress subcollections`);

  // Delete all courses
  const coursesSnap = await db.collection("courses").get();
  for (const doc of coursesSnap.docs) {
    const lessonsSnap = await db
      .collection("courses")
      .doc(doc.id)
      .collection("lessons")
      .get();
    for (const lessonDoc of lessonsSnap.docs) {
      await lessonDoc.ref.delete();
    }
    await doc.ref.delete();
  }
  console.log(`   ✓ Deleted courses and lessons subcollections\n`);
}

async function seedUsers() {
  console.log("👥 Seeding users...\n");

  for (const user of USERS) {
    try {
      await db.collection("users").doc(user.uid).set({
        email: user.email,
        name: user.name,
        role: user.role,
        photoURL: "",
        createdAt: new Date(),
      });
      console.log(`   ✓ ${user.email} (${user.role})`);
    } catch (err) {
      console.error(`   ✗ Failed to create ${user.email}:`, err.message);
    }
  }

  console.log();
}

async function seedCourses() {
  console.log("📚 Seeding courses...\n");

  for (const course of COURSES) {
    try {
      // Create course document
      await db.collection("courses").doc(course.id).set({
        title: course.title,
        description: course.description,
        lessonCount: course.lessons.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`   ✓ ${course.title} (${course.lessons.length} lessons)`);

      // Create lessons as subcollection
      const lessonsRef = db
        .collection("courses")
        .doc(course.id)
        .collection("lessons");

      for (let i = 0; i < course.lessons.length; i++) {
        await lessonsRef.add({
          title: course.lessons[i].title,
          description: course.lessons[i].description,
          order: i,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      console.error(`   ✗ Failed to create ${course.title}:`, err.message);
    }
  }

  console.log();
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    const args = process.argv.slice(2);
    const shouldReset = args.includes("--reset");

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   LMT Database Seed Script             ║");
    console.log("╚════════════════════════════════════════╝\n");

    if (shouldReset) {
      await deleteAllData();
    }

    await seedUsers();
    await seedCourses();

    console.log("╔════════════════════════════════════════╗");
    console.log("║   ✅ Seeding Complete!                 ║");
    console.log("╚════════════════════════════════════════╝\n");

    console.log("📖 Next steps:");
    console.log(
      "   1. Check Firestore security rules (see FIRESTORE_RULES.md)",
    );
    console.log("   2. Refresh your app to see courses and users");
    console.log("   3. Login with student@example.com / password\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
