import type { BloodGroup, UserRole } from "@/types";

export const bloodCompatibility = {
  canDonateTo: {
    "A+": ["A+", "AB+"],
    "A-": ["A+", "A-", "AB+", "AB-"],
    "B+": ["B+", "AB+"],
    "B-": ["B+", "B-", "AB+", "AB-"],
    "AB+": ["AB+"],
    "AB-": ["AB+", "AB-"],
    "O+": ["O+", "A+", "B+", "AB+"],
    "O-": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal Donor
  },
  canReceiveFrom: {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], // Universal Recipient
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"],
  },
};

export const getCompatibleDonors = (recipientBloodGroup: BloodGroup): BloodGroup[] => {
  return bloodCompatibility.canReceiveFrom[recipientBloodGroup];
};

export const getCompatibleRecipients = (donorBloodGroup: BloodGroup): BloodGroup[] => {
  return bloodCompatibility.canDonateTo[donorBloodGroup];
};

export const getCompatibilityInfo = (bloodGroup: BloodGroup, role: UserRole): string => {
    if (role === 'Donor') {
        const recipients = getCompatibleRecipients(bloodGroup).join(', ');
        if (bloodGroup === 'O-') {
            return `You are a universal donor! You can donate to all blood types.`;
        }
        return `As a donor with blood type ${bloodGroup}, you can donate to recipients with blood types: ${recipients}.`;
    } else { // Recipient
        const donors = getCompatibleDonors(bloodGroup).join(', ');
        if (bloodGroup === 'AB+') {
            return `You are a universal recipient! You can receive blood from all donor types.`;
        }
        return `As a recipient with blood type ${bloodGroup}, you can receive from donors with blood types: ${donors}.`;
    }
}
