// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from 'firebase/app';
import { FirebaseOptions } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyClRBogErA58pwloqCfjUUG-xxo0fgCvJI",
  authDomain: "login-b5d42.firebaseapp.com",
  projectId: "login-b5d42",
  storageBucket: "login-b5d42.firebasestorage.app",
  messagingSenderId: "338195590285",
  appId: "1:338195590285:web:3b25b0e22dfc65512106c4"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

export default app;