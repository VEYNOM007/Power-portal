'use client';

import { useEffect } from 'react';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseApp } from '@/lib/firebase/config';

// Ensure App Check is only initialized once
let appCheckInitialized = false;

export function AppCheckProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only initialize App Check on the client side and only once
    if (typeof window !== 'undefined' && !appCheckInitialized) {
      try {
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider('6LeI6aAsAAAAABll3XnUYAObJtGwzCrqcD7FP-IU'),
          isTokenAutoRefreshEnabled: true,
        });
        appCheckInitialized = true;
        console.log('[AppCheck] Success');
      } catch (e) {
        console.error('[AppCheck] Error initializing App Check:', e);
      }
    }
  }, []);

  return <>{children}</>;
}
