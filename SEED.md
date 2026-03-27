# Seed Script Instructions

## Option 1: Manual (Recommended for now)
Follow the steps in section 1 above to manually add courses via Firebase Console UI.

## Option 2: Automated Seed Script

### Prerequisites
1. Generate a service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in this folder

2. Install Firebase Admin:
   ```bash
   npm install firebase-admin
   ```

3. Run the seed script:
   ```bash
   node seed-courses.js
   ```

### Expected Output
```
Seeding courses...

✓ Added: Introduction to JavaScript (4 lessons)
✓ Added: React Fundamentals (5 lessons)
✓ Added: Firebase for Beginners (3 lessons)

✓ Seeding complete!
```
