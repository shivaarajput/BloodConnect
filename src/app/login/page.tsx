
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';

// This page is deprecated and redirects to the new unified landing page.
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
    </div>
  );
}
