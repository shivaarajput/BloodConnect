
"use client";

import Link from 'next/link';
import { Droplet, User as UserIcon, LogOut, HeartHandshake, LogIn, ShieldCheck, Users, Moon, Sun } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';

const Header = () => {
  const { currentUser, setCurrentUser } = useUser();
  const { authUser, setAuthUser } = useAuth(); // Using setAuthUser from AuthContext now
  const router = useRouter();
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();

  const handleLogout = async () => {
    try {
        // In a real Firebase app, you would call auth.signOut()
        // Here we mock by clearing both authUser and currentUser
        setAuthUser(null); 
        setCurrentUser(null);
        toast({title: "Logged Out", description: "You have been successfully logged out."})
        router.push('/');
    } catch (error) {
        toast({variant: "destructive", title: "Logout Failed", description: "Something went wrong."})
    }
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  // Use currentUser as the source of truth for logged-in state in the UI
  const isLoggedIn = !!currentUser;

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
       <TooltipProvider>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-2">
              <Droplet className="h-8 w-8 text-primary" />
              <h1 className="font-headline text-xl sm:text-2xl font-bold text-foreground">
                BloodConnect
              </h1>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            {isLoggedIn ? (
              <>
               {currentUser?.isAdmin ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button asChild variant="ghost">
                          <Link href="/admin/dashboard">
                            <Users className="h-5 w-5" />
                            <span className="hidden sm:inline ml-2">View All Users</span>
                          </Link>
                        </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                        <p>Admin Dashboard</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  currentUser?.bloodGroup && (
                    <Button asChild variant="ghost">
                      <Link href="/">
                        <HeartHandshake className="h-5 w-5" />
                        <span className="hidden sm:inline ml-2">Find Matches</span>
                      </Link>
                    </Button>
                  )
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-primary/50">
                           <AvatarFallback>{getInitials(currentUser?.fullName)}</AvatarFallback>
                        </Avatar>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{currentUser?.fullName || 'New User'}</p>

                        <p className="text-xs leading-none text-muted-foreground">
                           {currentUser?.isAdmin ? 'Administrator' : currentUser?.mobileNumber}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     {!currentUser?.isAdmin && (
                        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                     )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
                <Button asChild>
                    <Link href="/">
                        <LogIn className="h-5 w-5" />
                        <span className="hidden sm:inline ml-2">Login / Sign Up</span>
                    </Link>
                </Button>
            )}
          </nav>
        </div>
      </div>
      </TooltipProvider>
    </header>
  );
};

export default Header;
