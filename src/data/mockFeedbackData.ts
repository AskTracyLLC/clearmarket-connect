export interface FeedbackPost {
  id: string;
  title: string;
  description: string;
  category: 'bug-report' | 'feature-request';
  status: 'under-review' | 'planned' | 'in-progress' | 'completed' | 'closed';
  upvotes: number;
  userHasUpvoted: boolean;
  userIsFollowing: boolean;
  author: string;
  createdAt: string;
  comments: FeedbackComment[];
}

export interface FeedbackComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export const mockFeedbackPosts: FeedbackPost[] = [
  {
    id: '1',
    title: 'Add dark mode support',
    description: 'It would be great to have a dark mode toggle for better accessibility and user preference.',
    category: 'feature-request',
    status: 'planned',
    upvotes: 47,
    userHasUpvoted: false,
    userIsFollowing: false,
    author: 'Sarah M.',
    createdAt: '2024-01-15',
    comments: [
      {
        id: '1',
        author: 'John D.',
        content: 'This would be amazing! My eyes would thank you.',
        createdAt: '2024-01-16'
      },
      {
        id: '2',
        author: 'ClearMarket Team',
        content: 'Thanks for the suggestion! We\'re planning to implement this in Q2.',
        createdAt: '2024-01-18'
      }
    ]
  },
  {
    id: '2',
    title: 'Search filters not working on mobile',
    description: 'When I try to use search filters on my phone, the dropdown menu doesn\'t appear properly and I can\'t select options.',
    category: 'bug-report',
    status: 'under-review',
    upvotes: 23,
    userHasUpvoted: true,
    userIsFollowing: true,
    author: 'Mike R.',
    createdAt: '2024-01-20',
    comments: [
      {
        id: '3',
        author: 'Lisa K.',
        content: 'I\'m experiencing the same issue on my Android device.',
        createdAt: '2024-01-21'
      }
    ]
  },
  {
    id: '3',
    title: 'Bulk vendor comparison feature',
    description: 'Allow users to select multiple vendors and compare their services, pricing, and ratings side by side.',
    category: 'feature-request',
    status: 'in-progress',
    upvotes: 34,
    userHasUpvoted: false,
    userIsFollowing: false,
    author: 'Alex T.',
    createdAt: '2024-01-10',
    comments: []
  },
  {
    id: '4',
    title: 'Export vendor list as PDF',
    description: 'It would be helpful to export search results as a PDF for offline reference and sharing with team members.',
    category: 'feature-request',
    status: 'completed',
    upvotes: 18,
    userHasUpvoted: false,
    userIsFollowing: false,
    author: 'Jennifer L.',
    createdAt: '2024-01-05',
    comments: [
      {
        id: '4',
        author: 'ClearMarket Team',
        content: 'This feature is now live! You can find the export button in the search results page.',
        createdAt: '2024-01-25'
      }
    ]
  },
  {
    id: '5',
    title: 'Page loading very slowly',
    description: 'The vendor search page takes more than 10 seconds to load, especially when applying multiple filters.',
    category: 'bug-report',
    status: 'closed',
    upvotes: 12,
    userHasUpvoted: false,
    userIsFollowing: false,
    author: 'David W.',
    createdAt: '2024-01-01',
    comments: [
      {
        id: '5',
        author: 'ClearMarket Team',
        content: 'We\'ve optimized our search algorithms and this issue should now be resolved.',
        createdAt: '2024-01-12'
      }
    ]
  }
];