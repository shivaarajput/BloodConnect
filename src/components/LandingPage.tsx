
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns"
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '@/lib/firebase';

import RegistrationForm from './RegistrationForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/DatePicker';


const loginFormSchema = z.object({
  mobileNumber: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit mobile number.' }),
  dob: z.date({
    required_error: "Your date of birth is required.",
  }),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export default function LandingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const { setCurrentUser } = useUser();
    
    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            mobileNumber: '',
        },
    });

    const handleMobileLogin = async (data: LoginFormData) => {
        setLoading(true);
        const dobString = format(data.dob, 'yyyy-MM-dd');
        
        try {
            const q = query(
                collection(db, "users"),
                where("mobileNumber", "==", data.mobileNumber),
                where("dob", "==", dobString)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const foundUser = { id: userDoc.id, ...userDoc.data() } as any; // Firestore returns data()
                setCurrentUser(foundUser);
                toast({ title: "Login Successful", description: "Welcome back!" });
                if (foundUser.isAdmin) {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/');
                }
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Login Failed',
                    description: 'Mobile number and date of birth do not match. Please try again or register.',
                });
                loginForm.reset();
            }

        } catch (error) {
             toast({
                variant: 'destructive',
                title: 'Login Error',
                description: 'An error occurred while trying to log in. Please try again.',
            });
             console.error("Error logging in: ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleProfileSave = () => {
        router.push('/');
    }

    return (
        <div className="container mx-auto flex items-center justify-center min-h-screen-minus-header px-4 py-8 md:py-12">
            <style jsx>{`
                .min-h-screen-minus-header {
                min-height: calc(100vh - 80px); /* Adjust 80px to your header's height */
                }
            `}</style>
            <Card className="w-full max-w-2xl shadow-lg">
                <Tabs defaultValue="register" className="w-full">
                    <CardHeader>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="register" className="gap-2">
                                <UserPlus />
                                New User
                            </TabsTrigger>
                            <TabsTrigger value="login" className="gap-2">
                                <LogIn />
                                Returning User
                            </TabsTrigger>
                        </TabsList>
                    </CardHeader>

                    <TabsContent value="register">
                        <CardHeader className="text-center pt-0">
                            <CardTitle className="font-headline text-3xl">Join BloodConnect</CardTitle>
                            <CardDescription>Create your profile to save lives.</CardDescription>
                        </CardHeader>
                        <RegistrationForm onProfileSaved={handleProfileSave} />
                    </TabsContent>

                    <TabsContent value="login">
                        <CardHeader className="text-center pt-0">
                            <CardTitle className="font-headline text-3xl">Welcome Back!</CardTitle>
                            <CardDescription>Enter your mobile and DOB to log in.</CardDescription>
                        </CardHeader>
                         <CardContent>
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(handleMobileLogin)} className="space-y-6">
                                    <FormField
                                        control={loginForm.control}
                                        name="mobileNumber"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Registered Mobile Number</FormLabel>
                                            <FormControl>
                                            <Input type="tel" placeholder="1234567890" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={loginForm.control}
                                        name="dob"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                            <FormLabel>Date of birth</FormLabel>
                                            <FormControl>
                                                 <DatePicker
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    fromYear={1920}
                                                    toYear={new Date().getFullYear()}
                                                 />
                                            </FormControl>
                                            <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <LoaderCircle className="animate-spin" /> : 'Log In'}
                                </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
