'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        router.push('/auth');
      }, 1500);
      return;
    }

    if (token) {
      localStorage.setItem('accessToken', token);
      setTimeout(() => {
        router.push('/onboarding');
      }, 1000);
    } else {
      router.push('/auth');
    }
  }, [token, error, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex flex-col items-center justify-center space-y-4"
      >
        <img src="/logo.svg" alt="Relay" width={64} height={64} className="animate-pulse" />
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {error ? 'Authentication failed...' : 'Authenticating...'}
        </h2>
        <p className="text-sm text-zinc-500">
          {error ? 'Redirecting back to login.' : 'Please wait while we log you in.'}
        </p>
      </motion.div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
