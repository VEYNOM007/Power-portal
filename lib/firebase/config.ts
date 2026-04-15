import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: "AIzaSyCeiiA-ekDPMfTsxGppw7HECm8mM8mZqw0",
  authDomain: "power-prod-6bbba.firebaseapp.com",
  projectId: "power-prod-6bbba",
  storageBucket: "power-prod-6bbba.firebasestorage.app",
  messagingSenderId: "673738117408",
  appId: "1:673738117408:web:90a2338229b41324ee4745",
};

export const firebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// App Check — reCAPTCHA Enterprise (côté client uniquement)
if (typeof window !== 'undefined') {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider('6Lel6aAsAAAAOEU4lBBEpq4kt7aLKRrzZm2Oh1H'),
    isTokenAutoRefreshEnabled: true,
  });
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const functions = getFunctions(firebaseApp, "europe-west1");
