// firebase.config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // ✅ Proper import
import { getFirestore } from "firebase/firestore";

// Your Firebase config (keep your actual keys here)
const firebaseConfig = {
  apiKey: "AIzaSyDwovFoBuiPqOMQp5QbEl2iWC_mbw-dhmI",
  authDomain: "registration-72047.firebaseapp.com",
  projectId: "registration-72047",
  storageBucket: "registration-72047.firebasestorage.app",
  messagingSenderId: "154962277782",
  appId: "1:154962277782:web:0bb367027cbb01a1bb59b7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export the Auth instance once
export const auth = getAuth(app);
export const db = getFirestore(app);