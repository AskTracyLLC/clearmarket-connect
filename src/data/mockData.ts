import { differenceInDays, addDays } from "date-fns";

export const mockResults = [
  {
    id: 1,
    initials: "T.M.",
    distance: "4.2 mi away",
    systems: ["EZ", "IA"],
    inspectionTypes: ["Interior/Exterior", "Drive-by"],
    pricing: "$25-35"
  },
  {
    id: 2,
    initials: "J.D.",
    distance: "7.8 mi away",
    systems: ["IA", "SG"],
    inspectionTypes: ["Exterior Only", "Occupancy Check"],
    pricing: "$30-40"
  },
  {
    id: 3,
    initials: "M.R.",
    distance: "12.1 mi away",
    systems: ["EZ", "IA", "SG"],
    inspectionTypes: ["Interior/Exterior", "REO Trash Out"],
    pricing: "$45-55"
  }
];

export const mockConnections = [
  {
    id: 1,
    initials: "T.M.",
    name: "Tom Martinez",
    lastWorked: "2 weeks ago",
    projects: 3,
    lastReviewDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  {
    id: 2,
    initials: "S.K.",
    name: "Sarah Kim", 
    lastWorked: "1 month ago",
    projects: 5,
    lastReviewDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000) // 35 days ago
  },
  {
    id: 3,
    initials: "M.J.",
    name: "Mike Johnson",
    lastWorked: "3 weeks ago", 
    projects: 7,
    lastReviewDate: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000) // 29 days ago
  }
].map(connection => {
  const daysSinceReview = differenceInDays(new Date(), connection.lastReviewDate);
  const canReview = daysSinceReview >= 30;
  const nextReviewDate = addDays(connection.lastReviewDate, 30);
  const daysUntilNextReview = canReview ? 0 : 30 - daysSinceReview;
  
  return {
    ...connection,
    canReview,
    daysSinceReview,
    nextReviewDate,
    daysUntilNextReview
  };
});