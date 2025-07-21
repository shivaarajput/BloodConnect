export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type UserRole = "Donor" | "Recipient";

export interface User {
  id: string;
  fullName: string;
  mobileNumber: string;
  dob: string; // ISO 8601 format (YYYY-MM-DD)
  bloodGroup: BloodGroup;
  state: string;
  district: string;
  hospital: string;
  role: UserRole;
  isAdmin?: boolean;
}
