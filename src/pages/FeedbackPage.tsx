import React, { useState } from 'react';
import { MessageCircle, ThumbsUp, Clock, CheckCircle, Wrench, Lightbulb, AlertCircle, Mail, BarChart3, Shield } from 'lucide-react';

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
  const [wantsProgressReports, setWantsProgressReports] = useState(false);
  const [agreedToAnalytics, setAgreedToAnalytics] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // User type selection
  const [userType, setUserType] = useState(''); // 'vendor' or 'field_rep'

  // Company research fields (for vendors)
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [primaryService, setPrimaryService] = useState('');
  
  // Field rep research fields
  const [fieldRepName, setFieldRepName] = useState('');
  const [workTypes, setWorkTypes] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState('');
  
  // Common fields
  const [coverageAreas, setCoverageAreas] = useState([]);
  const [currentChallenges, setCurrentChallenges] = useState('');
  const [interestedFeatures, setInterestedFeatures] = useState([]);

  const serviceTypes = [
    { value: 'bpo', label: 'BPO Services' },
    { value: 'inspections', label: 'Property Inspections' },
    { value: 'preservation', label: 'Property Preservation' },
    { value: 'reo', label: 'REO Services' },
    { value: 'valuation', label: 'Property Valuation' },
    { value: 'maintenance', label: 'Property Maintenance' },
    { value: 'other', label: 'Other Services' }
  ];

  const fieldRepWorkTypes = [
    { value: 'interior-inspections', label: 'Interior Inspections' },
    { value: 'exterior-inspections', label: 'Exterior Inspections' },
    { value: 'occupancy-checks', label: 'Occupancy Checks' },
    { value: 'property-preservation', label: 'Property Preservation' },
    { value: 'winterizations', label: 'Winterizations' },
    { value: 'lawn-maintenance', label: 'Lawn Maintenance' },
    { value: 'lock-changes', label: 'Lock Changes' },
    { value: 'debris-removal', label: 'Debris Removal' },
    { value: 'photography', label: 'Photography Services' },
    { value: 'violations', label: 'Violation Monitoring' },
    { value: 'evictions', label: 'Eviction Services' },
    { value: 'cash-for-keys', label: 'Cash for Keys' }
  ];

  const experienceLevels = [
    { value: 'new', label: 'New (Less than 1 year)' },
    { value: 'beginner', label: 'Beginner (1-2 years)' },
    { value: 'experienced', label: 'Experienced (3-5 years)' },
    { value: 'expert', label: 'Expert (5+ years)' },
    { value: 'veteran', label: 'Veteran (10+ years)' }
  ];

  const vendorFeatureOptions = [
    { value: 'field-rep-search', label: 'Better Field Rep Search' },
    { value: 'coverage-mapping', label: 'Coverage Area Mapping' },
    { value: 'quality-scoring', label: 'Quality Scoring System' },
    { value: 'communication-tools', label: 'Communication Tools' },
    { value: 'scheduling', label: 'Scheduling & Calendar' },
    { value: 'payment-processing', label: 'Payment Processing' },
    { value: 'reporting', label: 'Reporting & Analytics' },
    { value: 'mobile-app', label: 'Mobile App' }
  ];

  const fieldRepFeatureOptions = [
    { value: 'job-matching', label: 'Better Job Matching' },
    { value: 'coverage-expansion', label: 'Coverage Area Tools' },
    { value: 'vendor-ratings', label: 'Vendor Rating System' },
    { value: 'quick-communication', label: 'Quick Communication' },
    { value: 'schedule-management', label: 'Schedule Management' },
    { value: 'payment-tracking', label: 'Payment Tracking' },
    { value: 'performance-analytics', label: 'Performance Reports' },
    { value: 'mobile-first', label: 'Mobile-First Design' }
  ];

  const stateOptions = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 
    'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 
    'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
    'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 
    'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const handleFeatureToggle = (feature) => {
    setInterestedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleWorkTypeToggle = (workType) => {
    setWorkTypes(prev => 
      prev.includes(workType) 
        ? prev.filter(w => w !== workType)
        : [...prev, workType]
    );
  };

  const handleCoverageToggle = (state) => {
    setCoverageAreas(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    // Reset form when switching user types
    setCompanyName('');
    setWebsite('');
    setPrimaryService('');
    setFieldRepName('');
    setWorkTypes([]);
    setExperienceLevel('');
    setCoverageAreas([]);
    setCurrentChallenges('');
    setInterestedFeatures([]);
  };

  const handleEmailSignup = async () => {
    if (!email || !agreedToAnalytics || !userType) {
      setToastMessage('Please complete all required fields and agree to our data policy.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Replace with actual Supabase call to launch_notifications table
      const signupData = {
        email,
        userType,
        wantsProgressReports,
        agreedToAnalytics,
        coverageAreas,
        currentChallenges,
        interestedFeatures,
        // Vendor-specific data
        ...(userType === 'vendor' && {
          companyName,
          website,
          primaryService
        }),
        // Field rep-specific data
        ...(userType === 'field_rep' && {
          fieldRepName,
          workTypes,
          experienceLevel
        })
      };
      
      console.log('Signup data:', signupData);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userTypeLabel = userType === 'vendor' ? 'vendor' : 'field representative';
      setToastMessage(`Thanks for signing up as a ${userTypeLabel}! We'll notify you when the feedback system launches${wantsProgressReports ? ' and send you progress updates' : ''}.`);
      setShowToast(true);
      
      // Reset form
      setEmail('');
      setUserType('');
      setCompanyName('');
      setWebsite('');
      setPrimaryService('');
      setFieldRepName('');
      setWorkTypes([]);
      setExperienceLevel('');
      setCoverageAreas([]);
      setCurrentChallenges('');
      setInterestedFeatures([]);
      setWantsProgressReports(false);
      setAgreedToAnalytics(false);
      
      setTimeout(() => setShowToast(false), 5000);
    } catch (error) {
      setToastMessage('Something went wrong. Please try again.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm leading-relaxed">{toastMessage}</div>
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
          
          {/* Enhanced Signup Form for Both User Types */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">Get Notified When We Launch</h3>
              <p className="text-gray-600 text-sm">
                Help us understand your needs while securing your spot for early access
              </p>
            </div>
            
            <div className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">I am a:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUserTypeChange('vendor')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      userType === 'vendor'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">Vendor/Company</div>
                    <div className="text-sm opacity-75">I need field representatives</div>
                  </button>
                  <button
                    onClick={() => handleUserTypeChange('field_rep')}
                    className={`p-4 border rounded-lg text-center transition-all ${
                      userType === 'field_rep'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <div className="font-medium">Field Representative</div>
                    <div className="text-sm opacity-75">I do property inspections/services</div>
                  </button>
                </div>
              </div>

              {userType && (
                <>
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Contact Information
                    </h4>
                    <input
                      type="email"
                      placeholder="Your email address *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Vendor-specific fields */}
                  {userType === 'vendor' && (
                    <>
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Company Information</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Company name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="url"
                            placeholder="Website (optional)"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Primary Service Type</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {serviceTypes.map((service) => (
                            <button
                              key={service.value}
                              onClick={() => setPrimaryService(service.value)}
                              className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                primaryService === service.value
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                              }`}
                            >
                              {service.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Field Rep-specific fields */}
                  {userType === 'field_rep' && (
                    <>
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Professional Information</h4>
                        <input
                          type="text"
                          placeholder="Your name or business name"
                          value={fieldRepName}
                          onChange={(e) => setFieldRepName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Experience Level</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {experienceLevels.map((level) => (
                            <button
                              key={level.value}
                              onClick={() => setExperienceLevel(level.value)}
                              className={`px-3 py-2 text-sm border rounded-md transition-colors text-left ${
                                experienceLevel === level.value
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                              }`}
                            >
                              {level.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Types of Work You Do</h4>
                        <p className="text-sm text-gray-600">Select all that apply</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {fieldRepWorkTypes.map((workType) => (
                            <label key={workType.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={workTypes.includes(workType.value)}
                                onChange={() => handleWorkTypeToggle(workType.value)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{workType.label}</span>
                            </label>
                          ))}
                        </div>
                        {workTypes.length > 0 && (
                          <div className="text-sm text-gray-600">
                            Selected: {workTypes.length} work type{workTypes.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Coverage Areas - Common for both */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Coverage Areas</h4>
                    <p className="text-sm text-gray-600">
                      {userType === 'vendor' 
                        ? 'Select states where you need field representative coverage'
                        : 'Select states where you currently work or want to work'
                      }
                    </p>
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {stateOptions.map((state) => (
                          <label key={state} className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={coverageAreas.includes(state)}
                              onChange={() => handleCoverageToggle(state)}
                              className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-gray-700">{state}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {coverageAreas.length > 0 && (
                      <div className="text-sm text-gray-600">
                        Selected: {coverageAreas.length} state{coverageAreas.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Current Challenges - Different prompts */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Current Challenges</h4>
                    <textarea
                      placeholder={
                        userType === 'vendor'
                          ? 'What are your biggest challenges in finding reliable field representatives? (optional)'
                          : 'What are your biggest challenges in finding consistent work or working with vendors? (optional)'
                      }
                      value={currentChallenges}
                      onChange={(e) => setCurrentChallenges(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                    />
                  </div>

                  {/* Interested Features - Different options */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Most Interested Features</h4>
                    <p className="text-sm text-gray-600">Select features you'd find most valuable</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(userType === 'vendor' ? vendorFeatureOptions : fieldRepFeatureOptions).map((feature) => (
                        <label key={feature.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={interestedFeatures.includes(feature.value)}
                            onChange={() => handleFeatureToggle(feature.value)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Progress Reports Option */}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                    <input
                      type="checkbox"
                      id="progress-reports"
                      checked={wantsProgressReports}
                      onChange={(e) => setWantsProgressReports(e.target.checked)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="progress-reports" className="text-sm font-medium text-gray-700 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="h-4 w-4 text-blue-600" />
                          Send me development progress updates
                        </div>
                      </label>
                      <p className="text-xs text-gray-600">
                        Get occasional emails about new features as we build them
                      </p>
                    </div>
                  </div>
                  
                  {/* Privacy Agreement */}
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                    <input
                      type="checkbox"
                      id="analytics-agreement"
                      checked={agreedToAnalytics}
                      onChange={(e) => setAgreedToAnalytics(e.target.checked)}
                      className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      required
                    />
                    <div className="flex-1">
                      <label htmlFor="analytics-agreement" className="text-sm font-medium text-gray-700 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-green-600" />
                          Privacy & Analytics Agreement
                        </div>
                      </label>
                      <p className="text-xs text-gray-600">
                        I agree to receive launch notifications. My information will be used for analytical purposes only and will never be sold to third parties. 
                        <a href="/privacy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleEmailSignup}
                    className="w-full px-4 py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isSubmitting || !email || !agreedToAnalytics || !userType}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting Information...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Mail className="h-4 w-4" />
                        Get Early Access to Feedback System
                      </div>
                    )}
                  </button>
                  
                  {(!email || !agreedToAnalytics || !userType) && (
                    <p className="text-xs text-gray-500 text-center">
                      Please complete all required fields and agree to our privacy policy
                    </p>
                  )}
                </>
              )}
            </div>
          </div>              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Contact Information
                </h4>
                <input
                  type="email"
                  placeholder="Your email address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Company Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="url"
                    placeholder="Website (optional)"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Primary Service Type */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Primary Service Type</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {serviceTypes.map((service) => (
                    <button
                      key={service.value}
                      onClick={() => setPrimaryService(service.value)}
                      className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                        primaryService === service.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {service.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coverage Areas */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Coverage Areas</h4>
                <p className="text-sm text-gray-600">Select states where you currently operate</p>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                    {stateOptions.map((state) => (
                      <label key={state} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={coverageAreas.includes(state)}
                          onChange={() => handleCoverageToggle(state)}
                          className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{state}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {coverageAreas.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Selected: {coverageAreas.length} state{coverageAreas.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Current Challenges */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Current Challenges</h4>
                <textarea
                  placeholder="What are your biggest challenges in finding reliable field representatives? (optional)"
                  value={currentChallenges}
                  onChange={(e) => setCurrentChallenges(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-20 resize-none"
                />
              </div>

              {/* Interested Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Most Interested Features</h4>
                <p className="text-sm text-gray-600">Select features you'd find most valuable</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {featureOptions.map((feature) => (
                    <label key={feature.value} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={interestedFeatures.includes(feature.value)}
                        onChange={() => handleFeatureToggle(feature.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Progress Reports Option */}
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                <input
                  type="checkbox"
                  id="progress-reports"
                  checked={wantsProgressReports}
                  onChange={(e) => setWantsProgressReports(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="progress-reports" className="text-sm font-medium text-gray-700 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      Send me development progress updates
                    </div>
                  </label>
                  <p className="text-xs text-gray-600">
                    Get occasional emails about new features as we build them
                  </p>
                </div>
              </div>
              
              {/* Privacy Agreement */}
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                <input
                  type="checkbox"
                  id="analytics-agreement"
                  checked={agreedToAnalytics}
                  onChange={(e) => setAgreedToAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  required
                />
                <div className="flex-1">
                  <label htmlFor="analytics-agreement" className="text-sm font-medium text-gray-700 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-4 w-4 text-green-600" />
                      Privacy & Analytics Agreement
                    </div>
                  </label>
                  <p className="text-xs text-gray-600">
                    I agree to receive launch notifications. My information will be used for analytical purposes only and will never be sold to third parties. 
                    <a href="/privacy" className="text-blue-600 hover:underline ml-1">Privacy Policy</a>
                  </p>
                </div>
              </div>
              
              <button 
                onClick={handleEmailSignup}
                className="w-full px-4 py-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting || !email || !agreedToAnalytics}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Information...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Get Early Access to Feedback System
                  </div>
                )}
              </button>
              
              {(!email || !agreedToAnalytics) && (
                <p className="text-xs text-gray-500 text-center">
                  {!email ? 'Please enter your email address' : 'Please agree to our privacy policy to continue'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Assurance Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Privacy Matters</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• <strong>No Spam:</strong> We'll only email you about the feedback system launch and progress updates (if requested)</p>
                  <p>• <strong>Analytics Only:</strong> Your email helps us understand interest levels and improve our launch strategy</p>
                  <p>• <strong>Never Sold:</strong> We will never sell, share, or rent your email address to third parties</p>
                  <p>• <strong>Easy Unsubscribe:</strong> You can unsubscribe from all communications at any time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What You'll Be Able to Do */}
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
            <button
              onClick={() => document.getElementById('progress-reports')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign Up Above ↑
            </button>
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