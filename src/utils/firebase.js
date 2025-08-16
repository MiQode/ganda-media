// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE,
  authDomain: 'ganda-media-agency.firebaseapp.com',
  projectId: 'ganda-media-agency',
  storageBucket: 'ganda-media-agency.firebasestorage.app',
  messagingSenderId: '110077050313',
  appId: '1:110077050313:web:b7a6541a7c4b8bdfb8bc18',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
