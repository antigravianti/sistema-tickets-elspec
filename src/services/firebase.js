import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyALMi2idmdHh-tBD9VLq2jBjS4J8xsr_oo",
    authDomain: "ticketsystem-elspec.firebaseapp.com",
    projectId: "ticketsystem-elspec",
    storageBucket: "ticketsystem-elspec.firebasestorage.app",
    messagingSenderId: "928651395872",
    appId: "1:928651395872:web:04821a717284c02a36cd45"
};

const app = initializeApp(firebaseConfig);
const db_firestore = getFirestore(app);

export { db_firestore };
