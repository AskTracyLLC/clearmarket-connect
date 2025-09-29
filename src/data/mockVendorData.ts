// Mock vendor data for credit system and network management
export interface VendorProfile {
  id: string;
  name: string;
  credits: number;
  network: VendorNetworkRep[];
  referralCode: string;
  referrals: VendorReferral[];
}

export interface VendorReferral {
  id: string;
  repName: string;
  repInitials: string;
  status: 'pending' | 'signed_up' | 'confirmed' | 'declined';
  dateReferred: Date;
  dateStatusChanged?: Date;
  creditEarned: boolean;
}

export interface VendorNetworkRep {
  repId: number;
  repInitials: string;
  addedMethod: 'unlocked' | 'referred' | 'confirmed';
  addedDate: Date;
  confirmed: boolean;
}

// Mock current vendor (in real app, this would come from auth/database)
export const mockCurrentVendor: VendorProfile = {
  id: "vendor-123",
  name: "Acme Property Services",
  credits: 5,
  referralCode: "ACME123",
  network: [
    {
      repId: 2,
      repInitials: "J.D.",
      addedMethod: 'unlocked',
      addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      confirmed: true
    }
  ],
  referrals: [
    {
      id: "ref-1",
      repName: "Alex Smith",
      repInitials: "A.S.",
      status: 'signed_up',
      dateReferred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      dateStatusChanged: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      creditEarned: false
    },
    {
      id: "ref-2",
      repName: "Mike Johnson",
      repInitials: "M.J.",
      status: 'confirmed',
      dateReferred: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      dateStatusChanged: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      creditEarned: true
    }
  ]
};

// Helper functions for credit system
export const isRepInNetwork = (repId: number): boolean => {
  return mockCurrentVendor.network.some(networkRep => 
    networkRep.repId === repId && networkRep.confirmed
  );
};

export const hasCreditsToUnlock = (): boolean => {
  return mockCurrentVendor.credits > 0;
};

// Track unlocked contacts separately from network
export const unlockedContacts: number[] = [];

export const isContactUnlocked = (repId: number): boolean => {
  return unlockedContacts.includes(repId);
};

export const unlockRepContact = (repId: number, repInitials: string): boolean => {
  if (!hasCreditsToUnlock()) return false;
  
  // Don't unlock if already unlocked
  if (isContactUnlocked(repId)) return false;
  
  // Consume credit
  mockCurrentVendor.credits -= 1;
  
  // Add to unlocked contacts (NOT network)
  unlockedContacts.push(repId);
  
  return true;
};

export const addRepToNetwork = (repId: number, repInitials: string): boolean => {
  // Don't add if already in network
  if (isRepInNetwork(repId)) return false;
  
  // Add to network as manually confirmed
  mockCurrentVendor.network.push({
    repId,
    repInitials,
    addedMethod: 'confirmed',
    addedDate: new Date(),
    confirmed: true
  });
  
  return true;
};

export const isRepUnlockedButNotInNetwork = (repId: number): boolean => {
  // Check if rep was unlocked but not officially added to network yet
  // For now, if they're unlocked, they're automatically in network
  // This could be expanded later for two-step process
  return false;
};

export const generateReferralLink = (): string => {
  return `https://clearmarket.io/signup?vendor=${mockCurrentVendor.id}&ref=${mockCurrentVendor.referralCode}`;
};

export const confirmReferral = (referralId: string): boolean => {
  const referral = mockCurrentVendor.referrals.find(ref => ref.id === referralId);
  if (!referral || referral.status !== 'signed_up') return false;
  
  // Update referral status
  referral.status = 'confirmed';
  referral.dateStatusChanged = new Date();
  referral.creditEarned = true;
  
  // Award credit
  mockCurrentVendor.credits += 1;
  
  // Add to network automatically
  const repId = Math.floor(Math.random() * 1000) + 100; // Mock rep ID
  mockCurrentVendor.network.push({
    repId,
    repInitials: referral.repInitials,
    addedMethod: 'referred',
    addedDate: new Date(),
    confirmed: true
  });
  
  return true;
};

export const addReferral = (repName: string, repInitials: string): string => {
  const referralId = `ref-${Date.now()}`;
  mockCurrentVendor.referrals.push({
    id: referralId,
    repName,
    repInitials,
    status: 'pending',
    dateReferred: new Date(),
    creditEarned: false
  });
  return referralId;
};