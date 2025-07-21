
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { User, BloodGroup, UserRole } from '@/types';
import locations from '@/lib/location.json';
import { bloodCompatibility } from '@/lib/blood-compatibility';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoaderCircle, ShieldCheck, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface LocationState {
    state: string;
    districts: string[];
}
interface LocationData {
  states: LocationState[];
}

const bloodGroups = Object.keys(bloodCompatibility.canDonateTo) as BloodGroup[];
const roles: UserRole[] = ['Donor', 'Recipient'];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { authUser, loading: authLoading } = useAuth();
  const { currentUser, users, loading: userLoading } = useUser();
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);


  const isLoading = authLoading || userLoading;

  useEffect(() => {
    if (!isLoading) {
      if (!authUser || !currentUser?.isAdmin) {
        router.push('/');
      }
    }
  }, [authUser, currentUser, isLoading, router]);

  const typedLocations: LocationData = locations;

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('');
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsAlertOpen(true);
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const stateMatch = !selectedState || selectedState === 'all-states' ? true : user.state === selectedState;
      const districtMatch = !selectedDistrict || selectedDistrict === 'all-districts' ? true : user.district === selectedDistrict;
      const roleMatch = !selectedRole || selectedRole === 'all-roles' ? true : user.role === selectedRole;
      const bloodGroupMatch = !selectedBloodGroup || selectedBloodGroup === 'all-blood-groups' ? true : user.bloodGroup === selectedBloodGroup;
      return stateMatch && districtMatch && roleMatch && bloodGroupMatch;
    });
  }, [users, selectedState, selectedDistrict, selectedRole, selectedBloodGroup]);

  if (isLoading || !currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderCircle className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-primary"/>
             <div>
                <CardTitle className="font-headline text-3xl">Admin Dashboard</CardTitle>
                <CardDescription>View and filter all registered users.</CardDescription>
             </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Select onValueChange={handleStateChange} value={selectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-states">All States</SelectItem>
                {typedLocations.states.map(s => (
                  <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedDistrict} value={selectedDistrict} disabled={!selectedState || selectedState === 'all-states'}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by District" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all-districts">All Districts</SelectItem>
                {selectedState && typedLocations.states.find(s => s.state === selectedState)?.districts.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedRole} value={selectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-roles">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedBloodGroup} value={selectedBloodGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Blood Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-blood-groups">All Blood Groups</SelectItem>
                {bloodGroups.map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-md">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2">Full Name</TableHead>
                  <TableHead className="px-2 text-center">Role</TableHead>
                  <TableHead className="px-2 text-center">Blood Group</TableHead>
                  <TableHead className="hidden md:table-cell px-2 text-center">Location</TableHead>
                  <TableHead className="hidden lg:table-cell px-2 text-center">Mobile</TableHead>
                  <TableHead className="hidden xl:table-cell px-2 text-center">Hospital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id} onClick={() => handleRowClick(user)} className="cursor-pointer">
                      <TableCell className="font-medium px-2 truncate">{user.fullName}</TableCell>
                      <TableCell className="px-2 text-center">
                         <Badge variant={user.role === 'Donor' ? 'default' : 'secondary'} className={`${user.role === 'Donor' ? `bg-primary` : `bg-accent`} inline-block`}>
                           {user.role}
                         </Badge>
                      </TableCell>
                       <TableCell className="px-2 text-center">
                        <Badge variant="outline">{user.bloodGroup}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell px-2 truncate text-center">{user.district}, {user.state}</TableCell>
                      <TableCell className="hidden lg:table-cell px-2 text-center">{user.mobileNumber}</TableCell>
                      <TableCell className="hidden xl:table-cell px-2 truncate text-center">{user.hospital}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No users found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contact User</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to call {selectedUser?.fullName} at {selectedUser?.mobileNumber}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
                <a href={`tel:${selectedUser?.mobileNumber}`} className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" /> Call
                </a>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
