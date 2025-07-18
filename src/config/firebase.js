import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuOwZQ9sjb0TKIj4YIur61TrwA3H46vZ0",
  authDomain: "upenn-math.firebaseapp.com",
  projectId: "upenn-math",
  storageBucket: "upenn-math.firebasestorage.app",
  messagingSenderId: "1076520175185",
  appId: "1:1076520175185:web:021ec99b6c11baa3639a70",
  measurementId: "G-BG0S16RDYM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

export default app; 