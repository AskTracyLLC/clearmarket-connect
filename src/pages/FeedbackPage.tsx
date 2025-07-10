import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Clock, CheckCircle, Wrench, Lightbulb, AlertCircle } from 'lucide-react';

// Static example feedback posts for the teaser
const exampleFeedbackPosts = [
  {
    id: '1',
    title: 'Add dark mode support',
    description: 'It would be great to have a dark mode toggle for better accessibility and user preference.',
    category: 'feature-request',
    status: 'planned',
    upvotes: 47,
    author: 'Sarah M.',
    createdAt: 'Jan 15, 2024',
    comments: 12
  },
  {
    id: '2',
    title: 'Search filters not working on mobile',
    description: 'When I try to use search filters on my phone, the dropdown menu doesn\'t appear properly.',
    category: 'bug-report',
    status: 'under-review',
    upvotes: 23,
    author: 'Mike R.',
    createdAt: 'Jan 20, 2024',
    comments: 8
  },
  {
    id: '3',
    title: 'Export vendor list as PDF',
    description: 'It would be helpful to export search results as a PDF for offline reference.',
    category: 'feature-request',
    status: 'completed',
    upvotes: 18,
    author: 'Jennifer L.',
    createdAt: 'Jan 5, 2024',
    comments: 5
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'in-progress':
      return <Wrench className="h-4 w-4 text-blue-600" />;
    case 'planned':
      return <Clock className="h-4 w-4 text-yellow-600" />;
    case 'under-review':
      return <AlertCircle className="h-4 w-4 text-orange-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'planned':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'under-review':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'feature-request':
      return <Lightbulb className="h-4 w-4 text-blue-600" />;
    case 'bug-report':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return <MessageCircle className="h-4 w-4 text-gray-600" />;
  }
};

const FeedbackTeaserPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleEmailSignup = async () => {
    if (!email) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setShowToast(true);
      setEmail('');
      setIsSubmitting(false);
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <div>
              <div className="font-medium">Thanks for your interest!</div>
              <div className="text-sm">We'll notify you when the feedback system launches.</div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <span className="font-bold text-xl">ClearMarket</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="/about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Wrench className="h-4 w-4" />
            Coming Soon
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Help Shape ClearMarket's Future
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're building a dedicated feedback system where you can suggest features, report bugs, 
            and help us prioritize what matters most to the property inspection community.
          </p>
          
          {/* Email Signup */}
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Get Notified</h3>
              <p className="text-gray-600">
                Be the first to know when our feedback system launches
              </p>
            </div>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                onClick={handleEmailSignup}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? "Signing up..." : "Notify Me"}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What You'll Be Able to Do
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <Lightbulb className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Suggest Features</h3>
              <p className="text-sm text-gray-600">
                Share ideas for new features that would improve your workflow
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Report Issues</h3>
              <p className="text-sm text-gray-600">
                Help us identify and fix bugs to improve the platform
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <ThumbsUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Vote & Discuss</h3>
              <p className="text-sm text-gray-600">
                Upvote ideas you like and discuss solutions with the community
              </p>
            </div>
          </div>
        </div>

        {/* Example Posts Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Preview: What the Feedback System Will Look Like
          </h2>
          
          <div className="space-y-4">
            {exampleFeedbackPosts.map((post) => (
              <div key={post.id} className="relative bg-white rounded-lg shadow-sm border">
                <div className="absolute inset-0 bg-gray-50/50 z-10 flex items-center justify-center">
                  <span className="bg-white px-3 py-1 rounded-full text-sm border shadow-sm text-gray-600">
                    Preview Only - Not Interactive
                  </span>
                </div>
                <div className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(post.category)}
                        <span className="px-2 py-1 text-xs border rounded-md">
                          {post.category === 'feature-request' ? 'Feature Request' : 'Bug Report'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-md flex items-center gap-1 ${getStatusColor(post.status)}`}>
                          {getStatusIcon(post.status)}
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-gray-600 mt-1">
                        {post.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {post.upvotes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>by {post.author}</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Want to Help Shape ClearMarket?
            </h3>
            <p className="text-gray-600 mb-4">
              Join our feedback community and have your voice heard in building 
              the future of property inspection networking.
            </p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleEmailSignup}
                disabled={isSubmitting || !email}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CM</span>
                </div>
                <span className="font-bold text-xl">ClearMarket</span>
              </div>
              <p className="text-gray-400">
                Connecting field representatives with vendors in the property inspection industry.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/help" className="hover:text-white">Help Center</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>support@clearmarket.com</li>
                <li>1-800-CLEAR-MKT</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ClearMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeedbackTeaserPage;