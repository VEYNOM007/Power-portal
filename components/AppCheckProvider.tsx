'use client';

import { useEffect } from 'react';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseApp } from '@/lib/firebase/config';

console.log('[AppCheck] Module loaded');

export function AppCheckProvider({ children }: { children: React.ReactNode }) {
  console.log('[AppCheck] Component rendering');

  useEffect(() => {
    console.log('[AppCheck] useEffect running');
    try {
      initializeAppCheck(firebaseApp, {
        provider: new ReCaptchaV3Provider('6LeI6aAAAAABll3XnUYAObJtGwzCrqcD7FP-IU'),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('[AppCheck] Success');
    } catch (e) {
      console.error('[AppCheck] Error:', e);
    }
  }, []);

  return <>{children}</>;
}
