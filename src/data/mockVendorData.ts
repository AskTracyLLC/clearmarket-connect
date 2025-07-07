// Mock vendor data for credit system and network management
export interface VendorProfile {
  id: string;
  name: string;
  credits: number;
  network: VendorNetworkRep[];
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
  network: [
    {
      repId: 2,
      repInitials: "J.D.",
      addedMethod: 'unlocked',
      addedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      confirmed: true
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

export const unlockRepContact = (repId: number, repInitials: string): boolean => {
  if (!hasCreditsToUnlock()) return false;
  
  // Consume credit
  mockCurrentVendor.credits -= 1;
  
  // Add to network as unlocked
  mockCurrentVendor.network.push({
    repId,
    repInitials,
    addedMethod: 'unlocked',
    addedDate: new Date(),
    confirmed: true
  });
  
  return true;
};