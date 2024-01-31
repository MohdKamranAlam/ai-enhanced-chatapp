
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxf3cEKU0riblSO3llgX_O5VsNlDY-m8Q",
  authDomain: "aichatbot-f424a.firebaseapp.com",
  projectId: "aichatbot-f424a",
  storageBucket: "aichatbot-f424a.appspot.com",
  messagingSenderId: "430892321549",
  appId: "1:430892321549:web:d4202b0db3b518b47afe44",
  measurementId: "G-NWB98RT0K3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);