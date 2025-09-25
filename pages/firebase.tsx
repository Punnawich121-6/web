// firebase.ts (ใช้ไฟล์เดิมของคุณ)
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { FirebaseOptions } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyClRBogErA58pwloqCfjUUG-xxo0fgCvJI",
  authDomain: "login-b5d42.firebaseapp.com",
  projectId: "login-b5d42",
  storageBucket: "login-b5d42.firebasestorage.app",
  messagingSenderId: "338195590285",
  appId: "1:338195590285:web:3b25b0e22dfc65512106c4",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
