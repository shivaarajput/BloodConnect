"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/types';
import { useToast } from "@/hooks/use-toast"
import { useAuth } from './AuthContext';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";

interface UserContextType {
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addUserProfile: (user: User) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { authUser, setAuthUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Establish a real-time listener to the 'users' collection in Firestore
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users from Firestore: ", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch user data.",
      });
      setLoading(false);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe();
  }, [toast]);


  useEffect(() => {
    // Sync UserContext's currentUser with AuthContext's authUser
    setCurrentUserState(authUser);
  }, [authUser]);
  
  const addUserProfile = async (newUserProfile: User) => {
    setLoading(true);
    try {
      // Use the user's ID as the document ID in Firestore
      await setDoc(doc(db, "users", newUserProfile.id), newUserProfile, { merge: true });
      
      const isUpdating = users.some(u => u.id === newUserProfile.id);
      toast({
        title: isUpdating ? "Profile Updated" : "Profile Created",
        description: isUpdating ? "Your information has been updated." : "Welcome! Your profile is ready.",
      });

    } catch (e) {
       console.error("Error writing user to Firestore: ", e);
       toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Could not save your information. Please try again.",
        });
    } finally {
        setLoading(false);
    }
  };

  const manuallySetCurrentUser = (user: User | null) => {
    // This is the single point of truth for setting the logged-in user.
    // It updates both the AuthContext (which handles persistence) and the local state.
    setAuthUser(user);
    setCurrentUserState(user);
  }

  return (
    <UserContext.Provider value={{ users, currentUser, addUserProfile, setCurrentUser: manuallySetCurrentUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};