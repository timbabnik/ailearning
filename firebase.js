// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSYEJRDXu1nIfRAxCaPf2K3oFrczOnLaw",
  authDomain: "tancy-1ab8a.firebaseapp.com",
  projectId: "tancy-1ab8a",
  storageBucket: "tancy-1ab8a.firebasestorage.app",
  messagingSenderId: "428731734901",
  appId: "1:428731734901:web:9384942f735661da78913c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider with web client ID
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { googleProvider };
export const db = getFirestore(app);

