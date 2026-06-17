import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8NSt3VP9jnVkzrGKPvNSqbnm7hwL-NqY",
  authDomain: "rajshahi-olimpiad-society.firebaseapp.com",
  projectId: "rajshahi-olimpiad-society",
  storageBucket: "rajshahi-olimpiad-society.firebasestorage.app",
  messagingSenderId: "248298850450",
  appId: "1:248298850450:web:d9e99750eddd9c7b18be4b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
