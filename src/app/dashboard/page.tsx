
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import RegistrationForm from '@/components/RegistrationForm';
import { LoaderCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { authUser, loading: authLoading } = useAuth();
  const { currentUser, loading: userLoading } = useUser();

  const isLoading = authLoading || userLoading;

  useEffect(() => {
    // Redirect unauthenticated users to the landing page
    if (!isLoading && !authUser) {
      router.push('/');
    }
  }, [authUser, isLoading, router]);

  // When a profile is saved, redirect to the nearby page.
  const handleProfileSave = () => {
    router.push('/');
  }

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
            {currentUser?.bloodGroup ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {currentUser?.bloodGroup ? 'Update your details below.' : 'Please provide your details to find compatible matches.'}
          </p>
        </div>
        <RegistrationForm 
          onProfileSaved={handleProfileSave} 
          existingUser={currentUser}
        />
      </div>
    </div>
  );
}
