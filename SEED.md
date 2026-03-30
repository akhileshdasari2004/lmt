# Seeding the Database

Populate Firestore with initial courses and users for local development and testing.

## Quick Start

```bash
# Seed the database with example data
node seed.js

# Reset database (DELETE ALL DATA - use with caution!)
node seed.js --reset
```

## What Gets Seeded

### Users

- **Admin User**: `admin@example.com` with role: "admin"
- **Student User**: `student@example.com` with role: "student"

### Courses

1. **Introduction to JavaScript** (3 lessons)
   - Variables and Data Types
   - Functions and Scope
   - DOM Manipulation

2. **React Fundamentals** (4 lessons)
   - Components and JSX
   - Props and State
   - useEffect Hook
   - Context API

3. **Firebase for Beginners** (3 lessons)
   - Firebase Setup
   - Firestore Basics
   - Firebase Authentication

## Setup Instructions

### 1. Configure Firebase Admin Access

The seed script requires Firebase Admin SDK. To set up authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click on your project → Project Settings (gear icon)
3. Go to **Service Accounts** tab
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in the project root

### 2. Install Dependencies

```bash
npm install firebase-admin
```

### 3. Run the Seed Script

```bash
# First-time setup (adds example data)
node seed.js

# Reset and reseed (be careful - this deletes everything!)
node seed.js --reset
```

## Using Example Data

Don't have a service account key yet? Use the example file to see the expected data structure:

```bash
cat firestore-data.example.json
```

This shows what data the seed script creates. After your first seed run, you can export your data from Firebase Console for backup.

## Troubleshooting

**Error: "serviceAccountKey.json not found"**

- Follow step 1 above to download the key from Firebase Console

**Error: "PERMISSION_DENIED"**

- Make sure your Firestore security rules allow writes from authenticated Firebase Admin SDK
- Check [FIRESTORE_RULES.md](FIRESTORE_RULES.md) for the correct rules

**Error: "Database not initialized"**

- Ensure your Firebase config is correct in `src/services/firebase.js`
- Create a Firestore database in Firebase Console if you haven't already

## Security Note

**Never commit `serviceAccountKey.json` to Git!** It's already in `.gitignore` but be extremely careful with this file — it has full database access.
