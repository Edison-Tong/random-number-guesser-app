// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCHbGFFtNLI2s66a9AwLlPYSVlPX6ZJL4",
  authDomain: "random-number-guesser-app.firebaseapp.com",
  projectId: "random-number-guesser-app",
  storageBucket: "random-number-guesser-app.firebasestorage.app",
  messagingSenderId: "283867323266",
  appId: "1:283867323266:web:207ec8902ab309b4328d9b",
  measurementId: "G-PL2S8RY005",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
