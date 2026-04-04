import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBcxZI-WYf4WlBuJHRFmFVmHOBAtS-XbDM",
  authDomain: "power-prod-6bbba.firebaseapp.com",
  projectId: "power-prod-6bbba",
  storageBucket: "power-prod-6bbba.firebasestorage.app",
  messagingSenderId: "215142808776",
  appId: "1:215142808776:web:2e9f7c8b3b9d15df2e1e81",
};

export const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
