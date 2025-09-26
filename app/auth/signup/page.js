'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to sign-in page since we're only using Google auth
    router.replace('/auth/signin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Redirecting...</h1>
          <p className="text-gray-600">Please wait while we redirect you to sign in page</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
          
          <p className="text-center text-gray-600">
            We now only support sign in with Google. You will be redirected automatically.
          </p>
        </div>
      </div>
    </div>
  );
}