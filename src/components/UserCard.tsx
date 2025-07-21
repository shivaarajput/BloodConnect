
"use client";

import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Phone, User as UserIcon } from 'lucide-react';

interface UserCardProps {
  user: User;
}

const UserCard = ({ user }: UserCardProps) => {
  const isUniversalDonor = user.bloodGroup === 'O-' && user.role === 'Donor';
  const isUniversalRecipient = user.bloodGroup === 'AB+' && user.role === 'Recipient';

  return (
    <Card className="flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-xl">{user.fullName}</CardTitle>
            <Badge variant={user.role === 'Donor' ? 'default' : 'secondary'} className={user.role === 'Donor' ? `bg-primary` : `bg-accent`}>
                {user.role}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Heart className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg text-foreground">{user.bloodGroup}</span>
          {isUniversalDonor && <Badge variant="outline" className="border-green-500 text-green-600">Universal Donor</Badge>}
          {isUniversalRecipient && <Badge variant="outline" className="border-blue-500 text-blue-600">Universal Recipient</Badge>}
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <MapPin className="h-5 w-5" />
          <span>{user.hospital}, {user.district}</span>
        </div>
         <div className="flex items-center gap-3 text-muted-foreground">
          <Phone className="h-5 w-5" />
          <span>+91 {user.mobileNumber}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-accent hover:bg-accent/90">
          <a href={`tel:${user.mobileNumber}`}>
            <Phone className="mr-2 h-4 w-4" />
            Contact {user.role}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
