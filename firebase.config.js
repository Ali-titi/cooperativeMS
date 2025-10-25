// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // ✅ Proper import
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJwHcxNCxa4XyZ-s_CEsxNWcgaM4TJWQQ",
  authDomain: "product-handle.firebaseapp.com",
  projectId: "product-handle",
  storageBucket: "product-handle.firebasestorage.app",
  messagingSenderId: "832132099139",
  appId: "1:832132099139:web:f8327fad710ca22e6bb8f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export the Auth instance once
export const auth = getAuth(app);
export const db = getFirestore(app);