'use client';

import { useEffect } from 'react';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { firebaseApp } from '@/lib/firebase/config';

export function AppCheckProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider('6LeI6aAAAAABll3XnUYAObJtGwzCrqcD7FP-IU'),
      isTokenAutoRefreshEnabled: true,
    });
  }, []);

  return <>{children}</>;
}
