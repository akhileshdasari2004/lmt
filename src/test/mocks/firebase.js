import { vi } from 'vitest';

export const mockUser = {
  uid: 'test-uid-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

export const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: vi.fn((cb) => { cb(mockUser); return vi.fn(); }),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockUser })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockUser })),
  signOut: vi.fn(() => Promise.resolve()),
};

export const mockDb = {};

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => mockAuth),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(mockUser); return vi.fn(); }),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockUser })),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: mockUser })),
  signOut: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockDb),
  collection: vi.fn(() => ({})),
  doc: vi.fn((...args) => ({ id: args[args.length - 1] || 'doc-id', path: args.slice(1).join('/') })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  getDoc: vi.fn(() => Promise.resolve({ exists: () => false, data: () => ({}) })),
  setDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  deleteDoc: vi.fn(() => Promise.resolve()),
  onSnapshot: vi.fn((ref, onNext) => {
    onNext({
      exists: () => true,
      data: () => ({
        name: 'Test User',
        role: 'student',
        status: 'approved',
        completedLessons: ['l1'],
      }),
    });
    return vi.fn();
  }),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  serverTimestamp: vi.fn(() => ({ seconds: 1, nanoseconds: 0 })),
  arrayUnion: vi.fn((v) => v),
  arrayRemove: vi.fn((v) => v),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(() => Promise.resolve({})),
  getDownloadURL: vi.fn(() => Promise.resolve('https://example.com/file.png')),
  deleteObject: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));
