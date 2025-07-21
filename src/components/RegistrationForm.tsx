
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser } from '@/context/UserContext';
import locations from '@/lib/location.json';
import { bloodCompatibility, getCompatibilityInfo } from '@/lib/blood-compatibility';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, LoaderCircle } from 'lucide-react';
import { DatePicker } from '@/components/DatePicker';
import { format } from "date-fns"
import type { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';


const bloodGroups = Object.keys(bloodCompatibility.canDonateTo) as (keyof typeof bloodCompatibility.canDonateTo)[];
const roles = ['Donor', 'Recipient'] as const;

const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  mobileNumber: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit mobile number.' }),
  dob: z.date({
    required_error: "Your date of birth is required.",
  }),
  bloodGroup: z.enum(bloodGroups, { required_error: 'Please select a blood group.' }),
  state: z.string({ required_error: 'Please select a state.' }),
  district: z.string({ required_error: 'Please select a district.' }),
  hospital: z.string().min(1, { message: 'Please enter a nearby hospital.' }),
  role: z.enum(roles, { required_error: 'Please select your role.' }),
  terms: z.boolean().refine(val => val === true, { message: 'You must accept the terms and conditions.' }),
});

type FormData = z.infer<typeof formSchema>;

interface LocationState {
    state: string;
    districts: string[];
}
interface LocationData {
  states: LocationState[];
}

interface RegistrationFormProps {
    onProfileSaved: () => void;
    existingUser?: User | null;
}

export default function RegistrationForm({ onProfileSaved, existingUser }: RegistrationFormProps) {
  const { addUserProfile, setCurrentUser, users } = useUser();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [compatibilityInfo, setCompatibilityInfo] = useState<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: existingUser?.fullName || '',
      mobileNumber: existingUser?.mobileNumber || '',
      dob: existingUser?.dob ? new Date(existingUser.dob) : undefined,
      bloodGroup: existingUser?.bloodGroup || undefined,
      role: existingUser?.role || undefined,
      state: existingUser?.state || '',
      district: existingUser?.district || '',
      hospital: existingUser?.hospital || '',
      terms: !!existingUser, // Terms are considered accepted for existing users
    }
  });

  const roleValue = form.watch('role');
  const bloodGroupValue = form.watch('bloodGroup');
  const selectedState = form.watch('state');

  useEffect(() => {
    if (roleValue && bloodGroupValue) {
      setCompatibilityInfo(getCompatibilityInfo(bloodGroupValue, roleValue as 'Donor' | 'Recipient'));
    } else {
      setCompatibilityInfo('');
    }
  }, [roleValue, bloodGroupValue]);

  const typedLocations: LocationData = locations;

  const districts = typedLocations.states.find(s => s.state === selectedState)?.districts || [];
  
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    // Format the date to a simple 'yyyy-MM-dd' string for consistent storage
    const dobString = format(data.dob, 'yyyy-MM-dd');
    const { terms, dob, ...userData } = data;

    let userToSave: User;

    if (existingUser) { // Editing existing profile
      userToSave = { ...existingUser, ...userData, dob: dobString };
    } else { // Creating new profile
      const userExists = users.some(u => u.mobileNumber === data.mobileNumber);
      if (userExists) {
        form.setError('mobileNumber', { type: 'manual', message: 'This mobile number is already registered. Please log in.' });
        setLoading(false);
        return;
      }
      
      userToSave = {
        ...userData,
        dob: dobString,
        id: uuidv4()
      }
    }
    
    try {
        await addUserProfile(userToSave);
        setCurrentUser(userToSave); // "Log in" the user
        toast({
            title: existingUser ? "Profile Updated" : "Profile Created",
            description: existingUser ? "Your information has been updated." : "Welcome! Your profile is ready.",
        });
        onProfileSaved();
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

  return (
    <Card className="w-full shadow-none border-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="1234567890" {...field} disabled={!!existingUser}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
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

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="bloodGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bloodGroups.map((group) => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {compatibilityInfo && (
              <div className="animate-fade-in-scale">
                <Alert className="border-accent text-accent">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="font-headline">Blood Compatibility Info</AlertTitle>
                  <AlertDescription>
                    {compatibilityInfo}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); form.setValue('district', ''); form.setValue('hospital', ''); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typedLocations.states.map((state) => (
                          <SelectItem key={state.state} value={state.state}>{state.state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); form.setValue('hospital', ''); }} value={field.value} disabled={!selectedState}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select district" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

             <FormField
                control={form.control}
                name="hospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nearby Hospital</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., City Hospital" {...field} />
                    </FormControl>
                     <FormDescription>
                      The hospital where you are likely to donate or receive blood.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            {!existingUser?.bloodGroup && (
                <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                        I agree to the terms and conditions
                        </FormLabel>
                        <FormDescription>
                        You agree to share your contact information for blood donation purposes.
                        </FormDescription>
                        <FormMessage />
                    </div>
                    </FormItem>
                )}
                />
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-6">
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={(!form.watch('terms') && !existingUser?.bloodGroup) || loading}>
               {loading ? <LoaderCircle className="animate-spin" /> : (existingUser ? "Save Profile" : "Register & Find Matches")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
