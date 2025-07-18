import React, { useState, useEffect, useRef, useReducer } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Link } from 'react-router-dom';
import RecaptchaWrapper from '@/components/ui/recaptcha-wrapper';
import { supabase } from '@/integrations/supabase/client';
import { useStates } from '@/hooks/useLocationData';
import { useToast } from '@/hooks/use-toast';
import { isDisposableEmail, checkRateLimit, checkDuplicateEmail, logSignupAttempt, getClientIP, validateHoneypot, getAntiSpamErrorMessage } from '@/utils/antiSpam';
import { Users, MapPin, Star, Shield, MessageSquare, Mail, CheckCircle, ArrowRight, Building, UserCheck, TrendingUp, Clock, BarChart3 } from 'lucide-react';

/**
 * Prelaunch Page Component
 * 
 * This component contains all the pre-launch functionality that was previously
 * in the main Index page. It includes:
 * - Pre-launch signup forms for both field reps and vendors
 * - Marketing content and feature previews
 * - Anti-spam protection and form validation
 * - Complete pre-launch user experience
 * 
 * Separated from Index.tsx to allow the main page to redirect here
 * while keeping all pre-launch logic intact and maintainable.
 */
interface FormState {
  email: string;
  userType: string;
  primaryState: string;
  companyName: string;
  companyWebsite: string;
  statesCovered: string[];
  fieldRepName: string;
  workTypes: string[];
  otherWorkType: string;
  experienceLevel: string;
  currentChallenges: string;
  interestedFeatures: string[];
  otherFeature: string;
  interestedInBetaTesting: boolean;
  agreedToAnalytics: boolean;
  primaryService: string;
  primaryServices: string[];
  otherService: string;
}

const initialFormState: FormState = {
  email: '',
  userType: '',
  primaryState: '',
  companyName: '',
  companyWebsite: '',
  statesCovered: [],
  fieldRepName: '',
  workTypes: [],
  otherWorkType: '',
  experienceLevel: '',
  currentChallenges: '',
  interestedFeatures: [],
  otherFeature: '',
  interestedInBetaTesting: false,
  agreedToAnalytics: false,
  primaryService: '',
  primaryServices: [],
  otherService: '',
};

type FormAction = 
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'TOGGLE_ARRAY_ITEM'; field: keyof FormState; item: string }
  | { type: 'RESET' };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_ARRAY_ITEM':
      const currentArray = state[action.field] as string[];
      const newArray = currentArray.includes(action.item)
        ? currentArray.filter(item => item !== action.item)
        : [...currentArray, action.item];
      return { ...state, [action.field]: newArray };
    case 'RESET':
      return initialFormState;
    default:
      return state;
  }
}

const Prelaunch = () => {
  const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailCount, setEmailCount] = useState(78);
  const [userPosition, setUserPosition] = useState({
    type: '',
    number: 0,
    fullUsername: ''
  });
  const { states, loading: statesLoading, error: statesError } = useStates();

  // Anti-spam states
  const [honeypotField, setHoneypotField] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [clientIP, setClientIP] = useState<string | undefined>(undefined);
  const {
    toast
  } = useToast();
  const recaptchaRef = useRef<any>(null);

  // 🆕 EMAIL TRIGGER FUNCTION
  const sendSignupEmail = async (signupData: {
    signupType: 'field-rep' | 'vendor';
    email: string;
    anonymous_username: string;
    interested_in_beta_testing?: boolean;
    credentials?: { email: string; password: string; };
  }) => {
    try {
      const emailFunction = signupData.interested_in_beta_testing ? 'send-beta-confirmation-email' : 'send-signup-email';
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke(emailFunction, {
        body: {
          signupType: signupData.signupType,
          email: signupData.email,
          anonymous_username: signupData.anonymous_username,
          beta_tester: signupData.interested_in_beta_testing || false,
          credentials: signupData.credentials
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        return { success: false, error: emailError };
      }

      console.log('Email sent successfully:', emailResult);
      return { success: true, data: emailResult };
    } catch (error) {
      console.error('Email trigger error:', error);
      return { success: false, error };
    }
  };

  // 🆕 BETA TESTER ACCOUNT CREATION
  const createBetaTesterAccount = async (signupData: {
    email: string;
    anonymous_username: string;
    signupType: 'field-rep' | 'vendor';
  }) => {
    try {
      // Use email as username and anonymous_username as password
      const credentials = {
        email: signupData.email,
        password: signupData.anonymous_username
      };

      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: {
            display_name: signupData.anonymous_username,
            user_type: signupData.signupType
          }
        }
      });

      if (authError) {
        console.error('Beta tester auth creation failed:', authError);
        return { success: false, error: authError };
      }

      // Mark email as verified immediately (skip verification)
      if (authData.user) {
        // Store in beta_testers table
        const { error: betaError } = await supabase
          .from('beta_testers')
          .insert([{
            email: signupData.email,
            user_type: signupData.signupType,
            name: signupData.anonymous_username,
            is_active: true
          }]);

        if (betaError) {
          console.error('Beta tester table insert failed:', betaError);
        }
      }

      return { success: true, credentials, authData };
    } catch (error) {
      console.error('Beta tester account creation error:', error);
      return { success: false, error };
    }
  };

  // Service types for vendors
  const serviceTypes = [{
    value: 'inspections',
    label: 'Property Inspections'
  }, {
    value: 'preservation',
    label: 'Property Preservation'
  }, {
    value: 'maintenance',
    label: 'Property Maintenance'
  }, {
    value: 'other',
    label: 'Other Services'
  }];

  // Work types for field reps
  const fieldRepWorkTypes = [{
    value: 'interior-exterior',
    label: 'Interior/Exterior'
  }, {
    value: 'occupancy-check',
    label: 'Occupancy Check'
  }, {
    value: 'insurance-loss',
    label: 'Insurance Loss'
  }, {
    value: 'preservation',
    label: 'Preservation'
  }, {
    value: 'photography-services',
    label: 'Photography Services'
  }, {
    value: 'notary-services',
    label: 'Notary Services'
  }, {
    value: 'commercial',
    label: 'Commercial'
  }, {
    value: 'other',
    label: 'Other'
  }];

  // Experience levels
  const experienceLevels = [{
    value: 'new',
    label: 'New (Less than 1 year)'
  }, {
    value: 'beginner',
    label: 'Beginner (1-2 years)'
  }, {
    value: 'experienced',
    label: 'Experienced (3-5 years)'
  }, {
    value: 'expert',
    label: 'Expert (5+ years)'
  }, {
    value: 'veteran',
    label: 'Veteran (10+ years)'
  }];

  // Feature options
  const vendorFeatureOptions = [{
    value: 'field-rep-search',
    label: 'Better Field Rep Search'
  }, {
    value: 'coverage-mapping',
    label: 'Coverage Area Mapping'
  }, {
    value: 'quality-scoring',
    label: 'Quality Scoring System'
  }, {
    value: 'communication-tools',
    label: 'Communication Tools'
  }, {
    value: 'scheduling',
    label: 'Scheduling & Calendar'
  }, {
    value: 'reporting',
    label: 'Reporting & Analytics'
  }, {
    value: 'other',
    label: 'Other'
  }];
  const fieldRepFeatureOptions = [{
    value: 'job-matching',
    label: 'Better Job Matching'
  }, {
    value: 'coverage-expansion',
    label: 'Coverage Area Tools'
  }, {
    value: 'vendor-ratings',
    label: 'Vendor Rating System'
  }, {
    value: 'quick-communication',
    label: 'Quick Communication'
  }, {
    value: 'schedule-management',
    label: 'Schedule Management'
  }, {
    value: 'performance-analytics',
    label: 'Performance Reports'
  }, {
    value: 'other',
    label: 'Other'
  }];

  useEffect(() => {
    console.log('🔄 States array updated:', states.length, 'states available');
    if (states.length > 0) {
      console.log('🔍 First few states:', states.slice(0, 3));
    }
    if (statesError) {
      console.error('❌ States error:', statesError);
    }
  }, [states, statesError]);

  // Debug log when states change
  useEffect(() => {
    console.log('🔄 States array updated:', states.length, 'states available');
    if (states.length > 0) {
      console.log('🔍 First few states:', states.slice(0, 3));
    }
  }, [states]);
  useEffect(() => {
    // Get client IP for rate limiting
    getClientIP().then(ip => setClientIP(ip));
  }, []);

  // Helper functions for multi-select
  const handleWorkTypeToggle = (workType: string) => {
    dispatch({ type: 'TOGGLE_ARRAY_ITEM', field: 'workTypes', item: workType });
  };
  const handleServiceToggle = (service: string) => {
    dispatch({ type: 'TOGGLE_ARRAY_ITEM', field: 'primaryServices', item: service });
  };
  const handleFeatureToggle = (feature: string) => {
    dispatch({ type: 'TOGGLE_ARRAY_ITEM', field: 'interestedFeatures', item: feature });
  };
  const handleStateToggle = (state: string) => {
    dispatch({ type: 'TOGGLE_ARRAY_ITEM', field: 'statesCovered', item: state });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.email || !formState.userType || !formState.agreedToAnalytics) return;

    // Field rep validation
    if (formState.userType === 'field-rep' && (!formState.primaryState || !formState.fieldRepName)) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Vendor validation
    if (formState.userType === 'vendor' && !formState.companyName) {
      toast({
        title: "Missing Information",
        description: "Please enter your company name.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
   
   // Debug logging for mobile signup issues
   console.log("=== SIGNUP ATTEMPT DEBUG ===");
   console.log("Form data:", {
     email: formState.email,
     userType: formState.userType,
     clientIP,
     recaptchaToken: recaptchaToken ? "present" : "missing",
     userAgent: navigator.userAgent,
     timestamp: new Date().toISOString(),
     isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
   });
    try {
      // Anti-spam validation
      const userAgent = navigator.userAgent;

      // 1. Validate honeypot field (should be empty)
      if (!validateHoneypot(honeypotField)) {
        await logSignupAttempt({
          email: formState.email,
          userType: formState.userType as 'field-rep' | 'vendor',
          ipAddress: clientIP,
          userAgent,
          success: false,
          failureReason: 'honeypot',
          honeypotFilled: true
        });
        toast({
          title: "Error",
          description: getAntiSpamErrorMessage('honeypot'),
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // 2. Validate reCAPTCHA
     // Debug reCAPTCHA status
     console.log("reCAPTCHA Debug:", {
       token: recaptchaToken ? "present" : "missing",
       tokenLength: recaptchaToken ? recaptchaToken.length : 0,
       userAgent: navigator.userAgent.substring(0, 100),
       isMobile: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
     });
     // TEMPORARILY DISABLED FOR MOBILE DEBUGGING - reCAPTCHA validation
     // Uncomment the lines below to re-enable reCAPTCHA validation
     /*
      if (!recaptchaToken) {
        toast({
          title: "Security Check Required",
          description: getAntiSpamErrorMessage("recaptcha_failed"),
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      */

      // 3. Check for disposable email
      if (isDisposableEmail(formState.email)) {
        await logSignupAttempt({
          email: formState.email,
          userType: formState.userType as 'field-rep' | 'vendor',
          ipAddress: clientIP,
          userAgent,
          success: false,
          failureReason: 'disposable_email',
          isDisposableEmail: true
        });
        toast({
          title: "Invalid Email",
          description: getAntiSpamErrorMessage('disposable_email'),
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // 4. Check rate limiting
     // Enhanced rate limiting with mobile network consideration
     const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
     
     console.log("Rate limit check:", {
       clientIP,
       isMobile,
       userAgent: userAgent.substring(0, 100)
     });
      const isWithinRateLimit = await checkRateLimit(clientIP);
      if (!isWithinRateLimit) {
        await logSignupAttempt({
          email: formState.email,
          userType: formState.userType as 'field-rep' | 'vendor',
          ipAddress: clientIP,
          userAgent,
          success: false,
          failureReason: 'rate_limit'
        });
        toast({
          title: "Rate Limit Exceeded",
          description: getAntiSpamErrorMessage('rate_limit'),
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // 5. Check for duplicate email across both tables
      const duplicateCheck = await checkDuplicateEmail(formState.email);
      if (duplicateCheck.exists) {
        await logSignupAttempt({
          email: formState.email,
          userType: formState.userType as 'field-rep' | 'vendor',
          ipAddress: clientIP,
          userAgent,
          success: false,
          failureReason: 'duplicate_email',
          metadata: {
            existingTable: duplicateCheck.table
          }
        });
        const tableType = duplicateCheck.table === 'field_rep_signups' ? 'field rep' : 'vendor';
        toast({
          title: "Already registered",
          description: `This email is already registered as a ${tableType}. You'll be notified when we launch!`
        });
        setIsLoading(false);
        return;
      }

      // Proceed with signup if all validations pass
      let generatedUsername = '';
      let betaCredentials = null;
      
      if (formState.userType === 'field-rep') {
        // Include the custom work type if "other" was selected
        const finalWorkTypes = formState.workTypes.includes('other') && formState.otherWorkType ? [...formState.workTypes.filter(w => w !== 'other'), formState.otherWorkType] : formState.workTypes;

        // Include the custom feature if "other" was selected
        const finalFeatures = formState.interestedFeatures.includes('other') && formState.otherFeature ? [...formState.interestedFeatures.filter(f => f !== 'other'), formState.otherFeature] : formState.interestedFeatures;

        const signupData = {
          email: formState.email,
          primary_state: formState.primaryState,
          field_rep_name: formState.fieldRepName,
          work_types: finalWorkTypes,
          experience_level: formState.experienceLevel,
          current_challenges: formState.currentChallenges ? [formState.currentChallenges] : [],
          interested_features: finalFeatures,
          interested_in_beta_testing: formState.interestedInBetaTesting,
          agreed_to_analytics: formState.agreedToAnalytics
          // Don't set anonymous_username - let the database generate it
        };
        
        const {
          data: insertedData,
          error
        } = await supabase.from('field_rep_signups').insert([signupData]).select('anonymous_username').single();
        if (error) throw error;
        
        // Get the actual username generated by the database
        generatedUsername = insertedData.anonymous_username;

        // 🆕 BETA TESTER FLOW - Create auth account for beta testers
        if (formState.interestedInBetaTesting) {
          const betaResult = await createBetaTesterAccount({
            email: formState.email,
            anonymous_username: generatedUsername,
            signupType: 'field-rep'
          });

          if (betaResult.success) {
            betaCredentials = betaResult.credentials;
            console.log('Beta tester account created successfully');
          } else {
            console.error('Beta tester account creation failed:', betaResult.error);
          }
        }

        // 🆕 SEND EMAIL (beta or regular)
        const emailResult = await sendSignupEmail({
          signupType: 'field-rep',
          email: formState.email,
          anonymous_username: generatedUsername,
          interested_in_beta_testing: formState.interestedInBetaTesting,
          credentials: betaCredentials
        });

        // Don't fail signup if email fails, just log it
        if (!emailResult.success) {
          console.error('Email failed but signup succeeded:', emailResult.error);
        }

        // Log successful signup
        await logSignupAttempt({
          email: formState.email,
          userType: 'field-rep',
          ipAddress: clientIP,
          userAgent,
          success: true,
          metadata: signupData
        });
      } else {
        // Include the custom service type if "other" was selected
        const finalServices = formState.primaryServices.includes('other') && formState.otherService ? [...formState.primaryServices.filter(s => s !== 'other'), formState.otherService] : formState.primaryServices;

        // Include the custom feature if "other" was selected
        const finalFeatures = formState.interestedFeatures.includes('other') && formState.otherFeature ? [...formState.interestedFeatures.filter(f => f !== 'other'), formState.otherFeature] : formState.interestedFeatures;

        const signupData = {
          email: formState.email,
          company_name: formState.companyName,
          company_website: formState.companyWebsite || null,
          states_covered: formState.statesCovered,
          primary_service: finalServices,
          current_challenges: formState.currentChallenges ? [formState.currentChallenges] : [],
          interested_features: finalFeatures,
          interested_in_beta_testing: formState.interestedInBetaTesting,
          agreed_to_analytics: formState.agreedToAnalytics
          // Don't set anonymous_username - let the database generate it
        };
        
        const {
          data: insertedData,
          error
        } = await supabase.from('vendor_signups').insert([signupData]).select('anonymous_username').single();
        if (error) throw error;
        
        // Get the actual username generated by the database
        generatedUsername = insertedData.anonymous_username;

        // 🆕 BETA TESTER FLOW - Create auth account for beta testers
        if (formState.interestedInBetaTesting) {
          const betaResult = await createBetaTesterAccount({
            email: formState.email,
            anonymous_username: generatedUsername,
            signupType: 'vendor'
          });

          if (betaResult.success) {
            betaCredentials = betaResult.credentials;
            console.log('Beta tester account created successfully');
          } else {
            console.error('Beta tester account creation failed:', betaResult.error);
          }
        }

        // 🆕 SEND EMAIL (beta or regular)
        const emailResult = await sendSignupEmail({
          signupType: 'vendor',
          email: formState.email,
          anonymous_username: generatedUsername,
          interested_in_beta_testing: formState.interestedInBetaTesting,
          credentials: betaCredentials
        });

        // Don't fail signup if email fails, just log it
        if (!emailResult.success) {
          console.error('Email failed but signup succeeded:', emailResult.error);
        }

        // Log successful signup
        await logSignupAttempt({
          email: formState.email,
          userType: 'vendor',
          ipAddress: clientIP,
          userAgent,
          success: true,
          metadata: signupData
        });
      }

      // Store the generated anonymous username for display
      console.log('🔍 Generated username:', generatedUsername);
      console.log('🔍 Setting userPosition with fullUsername:', generatedUsername);
      
      const newUserPosition = {
        type: '', // We'll use the full username instead of type + number
        number: 0, // Not needed anymore
        fullUsername: generatedUsername // Store the actual username
      };
      
      console.log('🔍 New userPosition object:', newUserPosition);
      
      // Poll database until we get the generated username
      let actualUsername = null;
      let attempts = 0;
      const maxAttempts = 20; // 10 seconds max (500ms * 20)
      
      while (!actualUsername && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
          const tableName = formState.userType === 'vendor' ? 'vendor_signups' : 'field_rep_signups';
          const { data: signupData } = await supabase
            .from(tableName)
            .select('anonymous_username')
            .eq('email', formState.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
          if (signupData?.anonymous_username) {
            actualUsername = signupData.anonymous_username;
            console.log(`✅ Retrieved username from database: ${actualUsername}`);
          }
        } catch (error) {
          console.log(`⏳ Attempt ${attempts}: Username not ready yet...`);
        }
      }
      
      // Update with actual username if found
      if (actualUsername) {
        setUserPosition({
          ...newUserPosition,
          fullUsername: actualUsername
        });
      } else {
        setUserPosition(newUserPosition);
      }
      
      setIsSubmitted(true);
      setEmailCount(prev => prev + 1);

      // Scroll to top of page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      toast({
        title: "Success!",
        description: "You've been added to our launch notification list."
      });
    } catch (error) {
     // Enhanced error logging for mobile debugging
     console.error("=== DETAILED SIGNUP ERROR ===");
     console.error("Error object:", error);
     console.error("Error details:", {
       message: error instanceof Error ? error.message : "Unknown error",
       stack: error instanceof Error ? error.stack : "No stack trace",
       userAgent: navigator.userAgent,
       timestamp: new Date().toISOString(),
        userType: formState.userType,
       email: formState.email,
       clientIP: clientIP,
       recaptchaToken: recaptchaToken ? "present" : "missing",
       formData: {
         userType: formState.userType,
        fieldRepName: formState.userType === "field-rep" ? formState.fieldRepName : undefined,
        companyName: formState.userType === "vendor" ? formState.companyName : undefined,
        primaryState: formState.userType === "field-rep" ? formState.primaryState : undefined
       }
     });

     // Check if this is a database constraint error
     let errorMessage = "Something went wrong. Please try again.";
     let errorCode = Date.now().toString().slice(-6);
     
     if (error instanceof Error) {
       // Provide more specific error messages
       if (error.message.includes("duplicate key") || error.message.includes("already exists")) {
         errorMessage = "This email is already registered. Please use a different email.";
       } else if (error.message.includes("violates check constraint") || error.message.includes("invalid input")) {
         errorMessage = "Please check your form data and try again.";
       } else if (error.message.includes("column") && error.message.includes("does not exist")) {
         errorMessage = "Database schema issue detected. Please contact support with error code: " + errorCode;
       } else if (error.message.includes("network") || error.message.includes("timeout")) {
         errorMessage = "Network connection issue. Please check your internet and try again.";
       } else if (error.message.includes("recaptcha") || error.message.includes("captcha")) {
         errorMessage = "Security verification failed. Please try refreshing the page and completing reCAPTCHA again.";
       } else {
         errorMessage = `Error: ${error.message}. If this persists, contact support with code: ${errorCode}`;
       }
     }

     // Log failed signup attempt with enhanced metadata
      await logSignupAttempt({
        email: formState.email,
        userType: formState.userType as "field-rep" | "vendor",
        ipAddress: clientIP,
        userAgent: navigator.userAgent,
        success: false,
        failureReason: "server_error",
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          errorDetails: error instanceof Error ? error.stack : "No details",
          errorCode: errorCode,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          recaptchaStatus: recaptchaToken ? "verified" : "missing",
          formValidation: {
            emailValid: !!formState.email,
            userTypeValid: !!formState.userType,
            analyticsAgreed: formState.agreedToAnalytics,
            fieldRepDataValid: formState.userType === "field-rep" ? !!(formState.primaryState && formState.fieldRepName) : true,
            vendorDataValid: formState.userType === "vendor" ? !!formState.companyName : true
          }
        }
      });
     
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const isFormValid = () => {
    if (!formState.email || !formState.userType || !formState.agreedToAnalytics) return false; // Removed reCAPTCHA requirement temporarily
    if (formState.userType === 'field-rep' && (!formState.primaryState || !formState.fieldRepName)) return false;
    if (formState.userType === 'vendor' && !formState.companyName) return false;
    return true;
  };
  const features = [{
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Verified Professional Network",
    description: "Connect with trusted field reps and vendors through our reputation-based scoring system."
  }, {
    icon: <MapPin className="h-8 w-8 text-accent" />,
    title: "Smart Coverage Mapping",
    description: "Visualize and manage coverage areas across all 50 states with county-level precision."
  }, {
    icon: <Star className="h-8 w-8 text-trust" />,
    title: "Credit-Based Economy",
    description: "Earn credits through community participation and use them to unlock premium features."
  }, {
    icon: <MessageSquare className="h-8 w-8 text-secondary" />,
    title: "Industry Community",
    description: "Share knowledge, ask questions, and stay updated with industry-specific discussions."
  }];
  const benefits = {
    fieldRep: ["Get discovered by quality vendors seeking coverage", "Build your professional reputation with verified reviews", "Access exclusive job features in your coverage areas", "Communicate with all your vendors in one private message", "Connect with industry peers and share knowledge"],
    vendor: ["Find reliable field reps in any county nationwide", "Verify credentials and track performance history", "Communicate with all field reps regardless of platform used", "Manage your coverage network efficiently", "Post coverage requests to qualified professionals only"]
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-muted/40 to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
      <div className="relative z-10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center space-x-2">
              <Link to="/auth">
                <img src="/lovable-uploads/5d315367-d1a1-4352-939e-bbe0ead13db2.png" alt="ClearMarket - Professional Field Inspection Network" className="w-8 h-8 rounded-lg" />
              </Link>
              <span className="text-xl font-bold text-foreground">ClearMarket</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Clock className="h-3 w-3 mr-1" />
                Coming Soon
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
            Pre-Launch • Help Shape What's Coming
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            The Professional Network for 
            <span className="text-primary block">Field Inspections</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            ClearMarket connects field representatives with vendors through a trusted, 
            credit-based platform designed specifically for the field inspection industry.
          </p>

          <div className="flex items-center justify-center space-x-6 mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">50</div>
              <div className="text-sm text-muted-foreground">States Covered</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">3,143</div>
              <div className="text-sm text-muted-foreground">Counties Mapped</div>
            </div>
          </div>

          {/* Enhanced Email Signup Form */}
          {!isSubmitted ? <Card className="max-w-3xl mx-auto p-8 shadow-elevated">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">
                Join ClearMarket - Help Shape Our Platform
              </h3>
              
              <div className="space-y-6">
                {/* User Type Selection */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Button type="button" variant={formState.userType === 'field-rep' ? 'default' : 'outline'} className="p-6 h-auto flex-col space-y-2" onClick={() => dispatch({ type: 'SET_FIELD', field: 'userType', value: 'field-rep' })}>
                    <UserCheck className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">I'm a Field Rep</div>
                      <div className="text-sm opacity-75">Looking for work features</div>
                    </div>
                  </Button>
                  
                  <Button type="button" variant={formState.userType === 'vendor' ? 'default' : 'outline'} className="p-6 h-auto flex-col space-y-2" onClick={() => dispatch({ type: 'SET_FIELD', field: 'userType', value: 'vendor' })}>
                    <Building className="h-6 w-6" />
                    <div>
                      <div className="font-semibold">I'm a Vendor</div>
                      <div className="text-sm opacity-75">Seeking field coverage</div>
                    </div>
                  </Button>
                </div>
                
                {formState.userType && <>
                    {/* Email Input */}
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Professional Email *
                      </Label>
                      <Input id="email" type="email" placeholder="Enter your professional email" value={formState.email} onChange={e => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })} className="mt-1 p-3" required />
                    </div>

                    {/* Field Rep Specific Fields */}
                    {formState.userType === 'field-rep' && <div className="space-y-4">
                        <div>
                          <Label htmlFor="field-rep-name" className="text-sm font-medium">
                            Your Name or Business Name *
                          </Label>
                          <Input id="field-rep-name" value={formState.fieldRepName} onChange={e => dispatch({ type: 'SET_FIELD', field: 'fieldRepName', value: e.target.value })} placeholder="Enter your name or business name" className="mt-1 p-3" required />
                        </div>

                        <div>
                          <Label htmlFor="primary-state" className="text-sm font-medium">
                            Primary State *
                          </Label>
                          <Select value={formState.primaryState} onValueChange={(value) => dispatch({ type: 'SET_FIELD', field: 'primaryState', value })}>
                            <SelectTrigger id="primary-state" className="mt-1">
                              <SelectValue placeholder={statesLoading ? "Loading states..." : states.length > 0 ? "Select your primary state" : "No states available"} />
                            </SelectTrigger>
                            <SelectContent className="z-[9999] bg-background border">
                              {statesLoading ? (
                                <SelectItem value="loading" disabled>Loading states...</SelectItem>
                              ) : states.length > 0 ? (
                                states.map(state => (
                                  <SelectItem key={state.code} value={state.code}>
                                    {state.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="error" disabled>Failed to load states</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          {/* Debug info */}
                          <p className="text-xs text-muted-foreground mt-1">
                            Debug: {statesLoading ? 'Loading...' : `${states.length} states loaded`}
                            {statesError && ` (Error: ${statesError})`}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Experience Level</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            {experienceLevels.map(level => <Button key={level.value} type="button" variant={formState.experienceLevel === level.value ? 'default' : 'outline'} className="text-left justify-start text-sm" onClick={() => dispatch({ type: 'SET_FIELD', field: 'experienceLevel', value: level.value })}>
                                {level.label}
                              </Button>)}
                          </div>
                        </div>

                         <div>
                           <Label className="text-sm font-medium">Types of Work You Do</Label>
                           <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
                           <div className="max-h-32 overflow-y-auto border rounded-md p-3">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                               {fieldRepWorkTypes.map(workType => <div key={workType.value} className="flex items-center space-x-2">
                                   <Checkbox id={workType.value} checked={formState.workTypes.includes(workType.value)} onCheckedChange={() => handleWorkTypeToggle(workType.value)} />
                                   <Label htmlFor={workType.value} className="text-sm cursor-pointer">
                                     {workType.label}
                                   </Label>
                                 </div>)}
                             </div>
                           </div>
                           {formState.workTypes.includes('other') && <div className="mt-3">
                               <Label htmlFor="other-work-type" className="text-sm font-medium">
                                 Specify Other Work Type
                               </Label>
                               <Input id="other-work-type" value={formState.otherWorkType} onChange={e => dispatch({ type: 'SET_FIELD', field: 'otherWorkType', value: e.target.value })} placeholder="Enter your specific work type" className="mt-1" />
                             </div>}
                           {formState.workTypes.length > 0 && <p className="text-xs text-muted-foreground mt-1">
                               Selected: {formState.workTypes.length} work type{formState.workTypes.length !== 1 ? 's' : ''}
                             </p>}
                         </div>
                      </div>}

                    {/* Vendor Specific Fields */}
                    {formState.userType === 'vendor' && <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="company-name" className="text-sm font-medium">
                              Company Name *
                            </Label>
                            <Input id="company-name" value={formState.companyName} onChange={e => dispatch({ type: 'SET_FIELD', field: 'companyName', value: e.target.value })} placeholder="Enter your company name" className="mt-1 p-3" required />
                          </div>
                          <div>
                            <Label htmlFor="company-website" className="text-sm font-medium">
                              Company Website <span className="text-muted-foreground">(Optional)</span>
                            </Label>
                            <Input id="company-website" value={formState.companyWebsite} onChange={e => dispatch({ type: 'SET_FIELD', field: 'companyWebsite', value: e.target.value })} placeholder="https://yourcompany.com" className="mt-1 p-3" />
                          </div>
                        </div>

                         <div>
                           <Label className="text-sm font-medium">Primary Service Types</Label>
                           <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
                           <div className="max-h-32 overflow-y-auto border rounded-md p-3">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                               {serviceTypes.map(service => <div key={service.value} className="flex items-center space-x-2">
                                   <Checkbox id={service.value} checked={formState.primaryServices.includes(service.value)} onCheckedChange={() => handleServiceToggle(service.value)} />
                                   <Label htmlFor={service.value} className="text-sm cursor-pointer">
                                     {service.label}
                                   </Label>
                                 </div>)}
                             </div>
                           </div>
                           {formState.primaryServices.includes('other') && <div className="mt-3">
                               <Label htmlFor="other-service" className="text-sm font-medium">
                                 Specify Other Service Type
                               </Label>
                               <Input id="other-service" value={formState.otherService} onChange={e => dispatch({ type: 'SET_FIELD', field: 'otherService', value: e.target.value })} placeholder="Enter your specific service type" className="mt-1" />
                             </div>}
                           {formState.primaryServices.length > 0 && <p className="text-xs text-muted-foreground mt-1">
                               Selected: {formState.primaryServices.length} service type{formState.primaryServices.length !== 1 ? 's' : ''}
                             </p>}
                         </div>

                        <div>
                          <Label className="text-sm font-medium">State(s) You Cover</Label>
                          <p className="text-xs text-muted-foreground mb-2">Select all that apply</p>
                           <div className="max-h-32 overflow-y-auto border rounded-md p-3">
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                               {states.length > 0 ? (
                                 states.map(state => (
                                   <div key={state.code} className="flex items-center space-x-2">
                                     <Checkbox 
                                       id={`state-${state.code}`} 
                                       checked={formState.statesCovered.includes(state.code)} 
                                       onCheckedChange={() => handleStateToggle(state.code)} 
                                     />
                                     <Label htmlFor={`state-${state.code}`} className="text-sm cursor-pointer">
                                       {state.name}
                                     </Label>
                                   </div>
                                 ))
                               ) : (
                                 <div className="col-span-full text-center text-muted-foreground">
                                   Loading states...
                                 </div>
                               )}
                             </div>
                           </div>
                           {/* Debug info */}
                           <p className="text-xs text-muted-foreground mt-1">
                             Debug: {states.length} states available
                           </p>
                            {formState.statesCovered.length > 0 && <p className="text-xs text-muted-foreground mt-1">
                                Selected: {formState.statesCovered.length} state{formState.statesCovered.length !== 1 ? 's' : ''}
                            </p>}
                        </div>
                      </div>}

                    {/* Common Fields */}
                    <div>
                      <Label htmlFor="challenges" className="text-sm font-medium">
                        Current Challenges <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      <Textarea id="challenges" placeholder={formState.userType === 'vendor' ? 'What are your biggest challenges in finding reliable field representatives?' : 'What are your biggest challenges in finding consistent work or working with vendors?'} value={formState.currentChallenges} onChange={e => dispatch({ type: 'SET_FIELD', field: 'currentChallenges', value: e.target.value })} className="mt-1" rows={3} />
                    </div>

                     <div>
                       <Label className="text-sm font-medium">Most Interested Features</Label>
                       <p className="text-xs text-muted-foreground mb-2">Select features you'd find most valuable</p>
                       <div className="max-h-32 overflow-y-auto border rounded-md p-3">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                           {(formState.userType === 'vendor' ? vendorFeatureOptions : fieldRepFeatureOptions).map(feature => <div key={feature.value} className="flex items-center space-x-2">
                               <Checkbox id={feature.value} checked={formState.interestedFeatures.includes(feature.value)} onCheckedChange={() => handleFeatureToggle(feature.value)} />
                               <Label htmlFor={feature.value} className="text-sm cursor-pointer">
                                 {feature.label}
                               </Label>
                             </div>)}
                         </div>
                       </div>
                       {formState.interestedFeatures.includes('other') && <div className="mt-3">
                           <Label htmlFor="other-feature" className="text-sm font-medium">
                             Specify Other Feature
                           </Label>
                           <Input id="other-feature" value={formState.otherFeature} onChange={e => dispatch({ type: 'SET_FIELD', field: 'otherFeature', value: e.target.value })} placeholder="Enter your specific feature interest" className="mt-1" />
                         </div>}
                     </div>

                    {/* Progress Reports */}
                    <div className="flex items-start space-x-3 p-4 bg-primary/5 rounded-lg border">
                      <Checkbox id="progress-reports" checked={formState.interestedInBetaTesting} onCheckedChange={checked => dispatch({ type: 'SET_FIELD', field: 'interestedInBetaTesting', value: checked === true })} className="mt-0.5" />
                       <div className="flex-1">
                         <Label htmlFor="progress-reports" className="text-sm font-medium cursor-pointer text-foreground flex items-center gap-2">
                           <BarChart3 className="h-4 w-4 text-primary" />
                           I'm Interested in being a Beta Tester for Early Access <span className="text-muted-foreground">(Optional)</span>
                         </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Get early access to test new features before they're released
                        </p>
                      </div>
                    </div>
                    

                    {/* Privacy Agreement */}
                    <div className="flex items-start space-x-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                      <Checkbox id="analytics-agreement" checked={formState.agreedToAnalytics} onCheckedChange={checked => dispatch({ type: 'SET_FIELD', field: 'agreedToAnalytics', value: checked === true })} className="mt-0.5" required />
                      <div className="flex-1">
                        <Label htmlFor="analytics-agreement" className="text-sm font-medium cursor-pointer text-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4 text-accent" />
                          Privacy & Analytics Agreement *
                        </Label>
                        <p className="text-xs text-foreground/80 mt-1">
                          I agree to receive launch notifications. My information will be used for analytical purposes only and will never be sold to third parties.
                        </p>
                      </div>
                    </div>

                    {/* Honeypot field - hidden from users */}
                    <input type="text" name="website" value={honeypotField} onChange={e => setHoneypotField(e.target.value)} style={{
                  display: 'none'
                }} tabIndex={-1} autoComplete="off" />

                    {/* reCAPTCHA */}
                    <div className="flex justify-center">
                      <RecaptchaWrapper onVerify={setRecaptchaToken} onExpired={() => setRecaptchaToken(null)} onError={() => setRecaptchaToken(null)} size="normal" theme="light" />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button onClick={handleSubmit} className="w-full py-3" disabled={!isFormValid() || isLoading}>
                        {isLoading ? 'Joining ClearMarket...' : 'Join ClearMarket - Get Early Access'}
                        {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                      </Button>
                    </div>

                    {!isFormValid() && <p className="text-xs text-muted-foreground text-center">
                        Please complete all required fields and agree to our privacy policy
                      </p>}
                  </>}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4 text-center"></p>
            </Card> : <Card className="max-w-2xl mx-auto p-8 shadow-elevated bg-accent/10 border-accent/20">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-accent mb-2">
                  You're on the list!
                </h3>
                <p className="text-accent/80 mb-4">
                  We'll notify you as soon as ClearMarket launches. Thanks for your interest!
                </p>
                <Badge className="bg-accent/20 text-accent">
                  {userPosition.fullUsername || 'Loading...'} to join
                </Badge>
              </div>
            </Card>}
        </div>
      </section>

      {/* Rest of your existing sections remain the same */}
      {/* Features Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Built for the Industry, By the Industry
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Every feature is designed specifically for field inspection professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => <Card key={index} className="p-6 text-center hover:shadow-elevated transition-shadow">
                <div className="mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Feature Screenshots */}
      <section className="py-20 bg-muted/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              See ClearMarket in Action
            </h2>
            <p className="text-xl text-muted-foreground">
              Preview the tools that will transform how you work
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Field Rep Network Alert Screenshot */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <Badge className="bg-primary/10 text-primary mb-4">For Field Reps</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Broadcast Updates to Your Entire Network
                </h3>
                <p className="text-muted-foreground mb-6">
                  Send one message to all your vendors instead of individual calls, texts, and emails.
                </p>
              </div>
              
              {/* Network Alert Mockup */}
              <div className="bg-background rounded-lg shadow-elevated p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Network Alert</h4>
                  <Badge variant="outline" className="text-xs">Draft</Badge>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">To:</label>
                    <div className="bg-primary/10 p-3 rounded border">
                      <div className="flex items-center text-sm text-primary">
                        <Users className="h-4 w-4 mr-2" />
                        All Network Vendors (12 contacts)
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Subject:</label>
                    <div className="bg-muted p-3 rounded border text-sm">
                      Travel Schedule Update - Multi-County Coverage
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-2">Message:</label>
                    <div className="bg-muted p-3 rounded border text-sm leading-relaxed">
                      Good morning everyone,<br /><br />
                      Travel update for this week:<br /><br />
                      TODAY: Starting in Kane County at 9 AM - have 4 REO inspections scheduled. 
                      Will be driving through DuPage County around 2 PM if anyone has urgent same-day needs.<br /><br />
                      TOMORROW: Heading to Will County first thing - completely open schedule and can take on 3-4 assignments. 
                      Also available for any overflow work in Cook County on my drive back.<br /><br />
                      As always, reports uploaded same day and photos geotagged.<br /><br />
                      Thanks,<br />
                      Mike Johnson
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      ✓ All vendors will receive via their preferred method
                    </div>
                    <Button size="sm" className="bg-primary">
                      Send to Network
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Vendor Coverage Search Screenshot */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <Badge className="bg-secondary/10 text-secondary mb-4">For Vendors</Badge>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Find Coverage Anywhere in the US
                </h3>
                <p className="text-muted-foreground mb-6">
                  Search by county, zip code, or state to find qualified field reps with verified coverage.
                </p>
              </div>
              
              {/* Coverage Search Mockup */}
              <div className="bg-background rounded-lg shadow-elevated p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground">Coverage Search</h4>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    Illinois
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input placeholder="Search counties or zip codes..." className="flex-1" />
                    <Button size="sm" variant="outline">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Button variant="outline" size="sm" className="justify-start">Cook County (47 reps)</Button>
                    <Button variant="outline" size="sm" className="justify-start">DuPage County (23 reps)</Button>
                    <Button variant="outline" size="sm" className="justify-start">Lake County (18 reps)</Button>
                    <Button variant="outline" size="sm" className="justify-start">Will County (31 reps)</Button>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium text-foreground mb-3">Cook County Field Reps</div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                            MJ
                          </div>
                          <div>
                            <div className="font-medium text-sm">Mike Johnson</div>
                            <div className="text-xs text-muted-foreground">Trust Score: 94 • 127 reviews</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">Available</Badge>
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-muted rounded">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-semibold">
                            AR
                          </div>
                          <div>
                            <div className="font-medium text-sm">Amanda Rodriguez</div>
                            <div className="text-xs text-muted-foreground">Trust Score: 89 • 203 reviews</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">Available</Badge>
                          <Button size="sm" variant="outline">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center pt-2">
                    <Button size="sm" className="bg-secondary">
                      Request Coverage
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What's In It For You?
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Field Rep Benefits */}
            <Card className="p-8 hover:shadow-elevated transition-shadow">
              <div className="flex items-center mb-6">
                <UserCheck className="h-8 w-8 text-primary mr-3" />
                <h3 className="text-2xl font-semibold text-foreground">For Field Representatives</h3>
              </div>
              <ul className="space-y-4">
                {benefits.fieldRep.map((benefit, index) => <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>)}
              </ul>
            </Card>

            {/* Vendor Benefits */}
            <Card className="p-8 hover:shadow-elevated transition-shadow">
              <div className="flex items-center mb-6">
                <Building className="h-8 w-8 text-secondary mr-3" />
                <h3 className="text-2xl font-semibold text-foreground">For Vendors</h3>
              </div>
              <ul className="space-y-4">
                {benefits.vendor.map((benefit, index) => <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>)}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Development Roadmap */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Building Something Great Takes Time
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/80">
            We're creating a platform that truly serves the field inspection community. 
            Join our founding members and help us build exactly what you need.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Gather Feedback</h3>
              <p className="text-primary-foreground/80 text-sm">Understanding what the community needs most</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Beta Launch</h3>
              <p className="text-primary-foreground/80 text-sm">Early access for founding members</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Full Platform</h3>
              <p className="text-primary-foreground/80 text-sm">Complete marketplace with all features</p>
            </div>
          </div>

          <Card className="bg-background text-foreground p-8">
            <h3 className="text-xl font-semibold mb-4">Want to Influence Development?</h3>
            <p className="text-muted-foreground mb-6">Sign up above and check the Beta Tester option to help shape ClearMarket's features, pricing, and user experience.</p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Link to="/admin-auth?bypass=admin" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer" aria-label="Go to ClearMarket Admin Login">
                <img src="/lovable-uploads/5d315367-d1a1-4352-939e-bbe0ead13db2.png" alt="ClearMarket - Professional Field Inspection Network" className="w-6 h-6 rounded" style={{
                  imageRendering: 'crisp-edges'
                }} />
                <span className="text-lg font-bold text-foreground">ClearMarket</span>
              </Link>
            </div>
            <p className="text-muted-foreground mb-4">
              The professional marketplace for field inspection services
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 ClearMarket. All rights reserved. | 
              hello@useclearmarket.io
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>;
};
export default Prelaunch;
