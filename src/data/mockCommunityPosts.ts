export interface CommunityPost {
  id: number;
  type: "Coverage Needed" | "Platform Help" | "Warnings" | "Tips" | "Industry News";
  title: string;
  content: string;
  authorInitials: string;
  isAnonymous: boolean;
  timePosted: Date;
  helpfulVotes: number;
  notHelpfulVotes: number;
  isFlagged: boolean;
  isFollowed: boolean;
  isSaved: boolean;
  isResolved: boolean;
  pinnedReplyId?: number;
  replies: Reply[];
  screenshots?: string[];
}

export interface Reply {
  id: number;
  content: string;
  authorInitials: string;
  timePosted: Date;
  helpfulVotes: number;
  notHelpfulVotes: number;
}

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 1,
    type: "Coverage Needed",
    title: "Urgent: Need coverage for Austin, TX area inspections",
    content: "I have 15 property inspections that need to be completed by Friday in the Austin metro area. Paying $35-45 per inspection. Must be familiar with REO properties.",
    authorInitials: "J.M.",
    isAnonymous: false,
    timePosted: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    helpfulVotes: 8,
    notHelpfulVotes: 1,
    isFlagged: false,
    isFollowed: true,
    isSaved: false,
    isResolved: false,
    replies: [
      {
        id: 101,
        content: "I can help with 5-7 of these. Sending you a DM.",
        authorInitials: "S.K.",
        timePosted: new Date(Date.now() - 1 * 60 * 60 * 1000),
        helpfulVotes: 3,
        notHelpfulVotes: 0
      }
    ]
  },
  {
    id: 2,
    type: "Platform Help",
    title: "How to upload photos in Clear Capital system?",
    content: "I'm new to Clear Capital and having trouble uploading exterior photos. The upload keeps failing. Any tips?",
    authorInitials: "M.R.",
    isAnonymous: false,
    timePosted: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    helpfulVotes: 12,
    notHelpfulVotes: 0,
    isFlagged: false,
    isFollowed: false,
    isSaved: true,
    isResolved: true,
    pinnedReplyId: 201,
    replies: [
      {
        id: 201,
        content: "Make sure your photos are under 5MB each and in JPG format. Also try clearing your browser cache.",
        authorInitials: "T.L.",
        timePosted: new Date(Date.now() - 3 * 60 * 60 * 1000),
        helpfulVotes: 8,
        notHelpfulVotes: 0
      },
      {
        id: 202,
        content: "I had the same issue. Try using Chrome instead of Safari - it worked for me.",
        authorInitials: "K.W.",
        timePosted: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        helpfulVotes: 5,
        notHelpfulVotes: 0
      }
    ]
  },
  {
    id: 3,
    type: "Warnings",
    title: "⚠️ Scam Alert: Fake inspection requests in Phoenix area",
    content: "WARNING: Someone is posting fake inspection jobs in Phoenix offering $100+ per inspection. They ask for personal info upfront. Don't fall for it!",
    authorInitials: "Anonymous",
    isAnonymous: true,
    timePosted: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    helpfulVotes: 24,
    notHelpfulVotes: 2,
    isFlagged: false,
    isFollowed: true,
    isSaved: false,
    isResolved: false,
    replies: [
      {
        id: 301,
        content: "Thanks for the heads up! Almost fell for this yesterday.",
        authorInitials: "D.P.",
        timePosted: new Date(Date.now() - 5 * 60 * 60 * 1000),
        helpfulVotes: 6,
        notHelpfulVotes: 0
      }
    ]
  },
  {
    id: 4,
    type: "Tips",
    title: "Pro tip: Best times to schedule inspections for max efficiency",
    content: "After 3 years in the field, I've found that scheduling inspections between 10 AM - 2 PM gives you the best lighting and fewer scheduling conflicts. Avoid early morning due to dew and late afternoon shadows.",
    authorInitials: "B.S.",
    isAnonymous: false,
    timePosted: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    helpfulVotes: 18,
    notHelpfulVotes: 3,
    isFlagged: false,
    isFollowed: false,
    isSaved: true,
    isResolved: false,
    replies: [
      {
        id: 401,
        content: "Great advice! I never thought about the dew factor.",
        authorInitials: "L.M.",
        timePosted: new Date(Date.now() - 10 * 60 * 60 * 1000),
        helpfulVotes: 4,
        notHelpfulVotes: 0
      }
    ]
  },
  {
    id: 5,
    type: "Industry News",
    title: "New regulations for REO properties in California effective March 2025",
    content: "California has updated their REO property inspection requirements. All inspectors must now include thermal imaging for properties over $500k value. Training courses available through state website.",
    authorInitials: "R.H.",
    isAnonymous: false,
    timePosted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    helpfulVotes: 15,
    notHelpfulVotes: 1,
    isFlagged: false,
    isFollowed: false,
    isSaved: false,
    isResolved: false,
    replies: []
  },
  {
    id: 6,
    type: "Platform Help",
    title: "ServiceLink system down again?",
    content: "Is anyone else having trouble logging into ServiceLink today? Been trying for 2 hours.",
    authorInitials: "Anonymous",
    isAnonymous: true,
    timePosted: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    helpfulVotes: 7,
    notHelpfulVotes: 12,
    isFlagged: true,
    isFollowed: false,
    isSaved: false,
    isResolved: false,
    replies: []
  }
];