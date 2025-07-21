
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { LoaderCircle, Users } from 'lucide-react';
import LandingPage from '@/components/LandingPage';
import UserCard from '@/components/UserCard';
import { getCompatibleDonors, getCompatibleRecipients } from '@/lib/blood-compatibility';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { authUser, loading: authLoading } = useAuth();
  const { currentUser, users, loading: userLoading } = useUser();
  const router = useRouter();

  const isLoading = authLoading || userLoading;

  useEffect(() => {
    if (!isLoading && authUser) {
      if (currentUser?.isAdmin) {
        router.push('/admin/dashboard');
      } else if (!currentUser?.bloodGroup) {
        // This case handles social logins where profile is not complete
        router.push('/dashboard');
      }
    }
  }, [authUser, currentUser, isLoading, router]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  // If not authenticated, show the landing page for login/registration
  if (!authUser) {
    return <LandingPage />;
  }

  // If we are here, user is logged in, not an admin, and has a profile.
  // Show skeleton while currentUser is potentially still loading after authUser is resolved
  if (!currentUser?.bloodGroup) {
     return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
           <Skeleton className="h-12 w-3/4 mx-auto" />
           <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
             <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const { state, district, role, bloodGroup } = currentUser;

  const targetRole = role === 'Donor' ? 'Recipient' : 'Donor';
  
  const compatibleBloodGroups = role === 'Donor'
    ? getCompatibleRecipients(bloodGroup)
    : getCompatibleDonors(bloodGroup);

  const nearbyUsers = users.filter(user =>
    user.id !== currentUser.id &&
    user.state === state &&
    user.district === district &&
    user.role === targetRole &&
    compatibleBloodGroups.includes(user.bloodGroup)
  );

  const pageTitle = `Compatible ${targetRole}s in ${district}`;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {`Showing potential ${targetRole.toLowerCase()} matches for you.`}
        </p>
      </div>
      
      {nearbyUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearbyUsers.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
            <Users className="w-16 h-16 text-muted-foreground/50 mb-4"/>
            <h2 className="text-2xl font-headline font-semibold text-secondary-foreground">No Compatible Users Found</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                There are currently no compatible {targetRole.toLowerCase()}s in your district. Please check back later or consider expanding your search.
            </p>
        </div>
      )}
    </div>
  );
}
