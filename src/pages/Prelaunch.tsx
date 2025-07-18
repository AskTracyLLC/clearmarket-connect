import { useState, useReducer, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import ClearMarketLogo from "@/components/ui/ClearMarketLogo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, UserCheck, Building2, MapPin, Calendar, TrendingUp, Users, Shield, ArrowRight, X, Briefcase } from "lucide-react";
import { useStates } from "@/hooks/useLocationData";
import { toast } from "sonner";

interface FormState {
  email: string;
  userType: 'field-rep' | 'vendor' | '';
  experienceLevel: string;
  statesCovered: string[];
  typeOfWork: string[];
  otherWorkType: string;
  challenges: string;
  mostInterestedFeatures: string;
  betaTesting: boolean;
  privacyConsent: boolean;
}

const initialState: FormState = {
  email: '',
  userType: '',
  experienceLevel: '',
  statesCovered: [],
  typeOfWork: [],
  otherWorkType: '',
  challenges: '',
  mostInterestedFeatures: '',
  betaTesting: false,
  privacyConsent: false,
};

type Action = 
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | { type: 'TOGGLE_STATE'; stateCode: string }
  | { type: 'TOGGLE_WORK_TYPE'; workType: string }
  | { type: 'RESET' };

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'TOGGLE_STATE':
      const isSelected = state.statesCovered.includes(action.stateCode);
      return {
        ...state,
        statesCovered: isSelected
          ? state.statesCovered.filter(code => code !== action.stateCode)
          : [...state.statesCovered, action.stateCode]
      };
    case 'TOGGLE_WORK_TYPE':
      const isWorkTypeSelected = state.typeOfWork.includes(action.workType);
      return {
        ...state,
        typeOfWork: isWorkTypeSelected
          ? state.typeOfWork.filter(w => w !== action.workType)
          : [...state.typeOfWork, action.workType]
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const Prelaunch = () => {
  const [formState, dispatch] = useReducer(formReducer, initialState);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailCount, setEmailCount] = useState(78);
  
  // Debug the states loading
  const { states, loading: statesLoading, error: statesError } = useStates();
  console.log('States loading:', statesLoading, 'States count:', states.length, 'Error:', statesError);
  
  // Fallback states list if hook fails
  const fallbackStates = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];
  
  // Use fallback if states from hook are empty or loading fails
  const availableStates = states.length > 0 ? states : fallbackStates;
  
  console.log('Available states:', availableStates.length, 'First few:', availableStates.slice(0, 3));
  
  const [userPosition, setUserPosition] = useState({
    type: '',
    number: 0,
    fullUsername: ''
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setEmailCount(prev => prev + Math.floor(Math.random() * 3));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const experienceLevels = [
    "New to the industry (0-1 years)",
    "Some experience (2-3 years)", 
    "Experienced (4-7 years)",
    "Very experienced (8+ years)",
    "Industry veteran (15+ years)"
  ];

  const workTypes = [
    "Property Inspections",
    "BPO (Broker Price Opinion)",
    "Occupancy Checks", 
    "Damage Assessments",
    "REO Services",
    "Field Services",
    "Property Preservation",
    "Appraisal Services",
    "Insurance Inspections",
    "Compliance Checks",
    "Other"
  ];

  const isFormValid = () => {
    return formState.email && 
           formState.userType && 
           formState.experienceLevel &&
           formState.statesCovered.length > 0 &&
           formState.typeOfWork.length > 0 &&
           // If "Other" is selected, require the other field to be filled
           (!formState.typeOfWork.includes("Other") || formState.otherWorkType.trim() !== '') &&
           formState.privacyConsent;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    
    setIsLoading(true);
    
    try {
      // Use the new consolidated table
      const { error } = await supabase
        .from('pre_launch_signups')
        .insert({
          email: formState.email,
          user_type: formState.userType,
          experience_level: formState.experienceLevel,
          states_covered: formState.statesCovered,
          type_of_work: formState.typeOfWork.map(work => 
            work === "Other" ? `Other: ${formState.otherWorkType}` : work
          ),
          current_challenges: formState.challenges,
          most_interested_features: formState.mostInterestedFeatures,
          interested_in_beta_testing: formState.betaTesting,
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Successfully joined the waitlist! Check your email for a welcome message.");
      
      // Email will be automatically sent via database trigger
      // Beta testers get enhanced welcome email with NDA info
      // Standard signups get regular welcome email
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeState = (stateToRemove: string) => {
    dispatch({ type: 'TOGGLE_STATE', stateCode: stateToRemove });
  };

  const removeWorkType = (workTypeToRemove: string) => {
    dispatch({ type: 'TOGGLE_WORK_TYPE', workType: workTypeToRemove });
  };

  const filteredStates = availableStates.filter(state => 
    state.name.toLowerCase().includes(stateSearch.toLowerCase()) &&
    !formState.statesCovered.includes(state.code)
  );

  const getSelectedStateNames = () => {
    return formState.statesCovered.map(code => {
      const state = availableStates.find(s => s.code === code);
      return state ? state.name : code;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <ClearMarketLogo />
              <Badge variant="secondary" className="text-xs">
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
          {!isSubmitted ? (
            <Card className="max-w-3xl mx-auto p-8 shadow-elevated">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">
                Join ClearMarket - Help Shape Our Platform
              </h3>
              
              <div className="space-y-6">
                {/* User Type Selection - Required */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">
                    I am a: <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button 
                      type="button" 
                      variant={formState.userType === 'field-rep' ? 'default' : 'outline'} 
                      className="p-6 h-auto flex-col space-y-2" 
                      onClick={() => dispatch({ type: 'SET_FIELD', field: 'userType', value: 'field-rep' })}
                    >
                      <UserCheck className="h-6 w-6" />
                      <div>
                        <div className="font-semibold">Field Rep</div>
                        <div className="text-sm opacity-75">Looking for work</div>
                      </div>
                    </Button>
                    <Button 
                      type="button" 
                      variant={formState.userType === 'vendor' ? 'default' : 'outline'} 
                      className="p-6 h-auto flex-col space-y-2" 
                      onClick={() => dispatch({ type: 'SET_FIELD', field: 'userType', value: 'vendor' })}
                    >
                      <Building2 className="h-6 w-6" />
                      <div>
                        <div className="font-semibold">Vendor</div>
                        <div className="text-sm opacity-75">Seeking coverage</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@company.com"
                    value={formState.email}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>

                {/* Experience Level */}
                <div>
                  <Label className="text-sm font-medium">
                    Experience Level <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formState.experienceLevel} 
                    onValueChange={(value) => dispatch({ type: 'SET_FIELD', field: 'experienceLevel', value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* States You Work In */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    States You Work In <span className="text-red-500">*</span>
                  </Label>
                  
                  {/* Selected States */}
                  {formState.statesCovered.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                      {getSelectedStateNames().map((stateName, index) => (
                        <Badge key={stateName} variant="secondary" className="pr-1">
                          {stateName}
                          <button
                            type="button"
                            onClick={() => removeState(formState.statesCovered[index])}
                            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* State Search */}
                  <div className="relative">
                    <Input
                      placeholder="Search and select states..."
                      value={stateSearch}
                      onChange={(e) => {
                        console.log('State search changed:', e.target.value);
                        setStateSearch(e.target.value);
                      }}
                    />
                    {stateSearch && filteredStates.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-background border border-border rounded-md mt-1 max-h-40 overflow-y-auto">
                        {filteredStates.slice(0, 5).map((state) => (
                          <button
                            key={state.code}
                            type="button"
                            onClick={() => {
                              console.log('Selecting state:', state.name, state.code);
                              dispatch({ type: 'TOGGLE_STATE', stateCode: state.code });
                              setStateSearch("");
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                          >
                            {state.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {stateSearch && filteredStates.length === 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-background border border-border rounded-md mt-1 p-3">
                        <p className="text-sm text-muted-foreground">No states found matching "{stateSearch}"</p>
                      </div>
                    )}
                  </div>
                  {formState.statesCovered.length === 0 && (
                    <p className="text-sm text-muted-foreground">Please select at least one state</p>
                  )}
                </div>

                {/* Type of Work */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Type of Work <span className="text-red-500">*</span>
                  </Label>
                  
                  {/* Debug info for work types */}
                  <p className="text-xs text-muted-foreground">
                    Debug: {workTypes.length} work types available
                  </p>
                  
                  {/* Selected Work Types Display */}
                  {formState.typeOfWork.length > 0 && (
                    <div className="p-3 bg-muted/50 rounded-lg mb-3">
                      <p className="text-sm font-medium mb-2">Selected Work Types ({formState.typeOfWork.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {formState.typeOfWork.map((workType) => (
                          <Badge key={workType} variant="secondary" className="pr-1">
                            {workType}
                            <button
                              type="button"
                              onClick={() => {
                                removeWorkType(workType);
                                // Clear other field if "Other" is unchecked
                                if (workType === "Other") {
                                  dispatch({ type: 'SET_FIELD', field: 'otherWorkType', value: '' });
                                }
                              }}
                              className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Types Checkbox Grid */}
                  <div className="border rounded-lg p-4 bg-background">
                    <p className="text-sm font-medium mb-3">Select all that apply:</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {workTypes.map((workType, index) => {
                        const checkboxId = `work-${workType.replace(/\s+/g, '-').toLowerCase()}`;
                        const isChecked = formState.typeOfWork.includes(workType);
                        
                        console.log(`Rendering work type: ${workType}, checked: ${isChecked}`);
                        
                        return (
                          <div key={workType} className="flex items-start space-x-2">
                            <Checkbox
                              id={checkboxId}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                console.log(`Checkbox changed: ${workType}, checked: ${checked}`);
                                if (checked) {
                                  dispatch({ type: 'TOGGLE_WORK_TYPE', workType });
                                } else {
                                  removeWorkType(workType);
                                  // Clear other field if "Other" is unchecked
                                  if (workType === "Other") {
                                    dispatch({ type: 'SET_FIELD', field: 'otherWorkType', value: '' });
                                  }
                                }
                              }}
                            />
                            <Label 
                              htmlFor={checkboxId} 
                              className="text-sm cursor-pointer leading-tight flex-1"
                            >
                              {workType}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Other Work Type Text Field */}
                  {formState.typeOfWork.includes("Other") && (
                    <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label htmlFor="otherWorkType" className="text-sm font-medium text-blue-900">
                        Please specify other work type: <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="otherWorkType"
                        placeholder="e.g., Environmental Inspections, Code Compliance, etc."
                        value={formState.otherWorkType}
                        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'otherWorkType', value: e.target.value })}
                        className="max-w-md"
                      />
                    </div>
                  )}

                  {formState.typeOfWork.length === 0 && (
                    <p className="text-sm text-muted-foreground">Please select at least one work type</p>
                  )}
                </div>

                {/* Current Challenges */}
                <div>
                  <Label htmlFor="challenges" className="text-sm font-medium">
                    Current Challenges
                  </Label>
                  <Textarea
                    id="challenges"
                    placeholder="What are your biggest challenges in finding work/coverage? (e.g., finding reliable professionals, inconsistent work, payment delays, etc.)"
                    value={formState.challenges}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'challenges', value: e.target.value })}
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>

                {/* Most Interested Features */}
                <div>
                  <Label htmlFor="mostInterestedFeatures" className="text-sm font-medium">
                    Most Interested Features
                  </Label>
                  <Textarea
                    id="mostInterestedFeatures"
                    placeholder="Which features are you most excited about? (e.g., trust scores, coverage mapping, direct messaging, credit system, etc.)"
                    value={formState.mostInterestedFeatures}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'mostInterestedFeatures', value: e.target.value })}
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>

                {/* Beta Testing */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="beta"
                    checked={formState.betaTesting}
                    onCheckedChange={(checked) => dispatch({ type: 'SET_FIELD', field: 'betaTesting', value: checked })}
                  />
                  <Label htmlFor="beta" className="text-sm">
                    I'm interested in beta testing new features
                  </Label>
                </div>

                {/* Privacy Consent */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={formState.privacyConsent}
                    onCheckedChange={(checked) => dispatch({ type: 'SET_FIELD', field: 'privacyConsent', value: checked })}
                  />
                  <Label htmlFor="privacy" className="text-sm">
                    I agree to receive updates about ClearMarket <span className="text-red-500">*</span>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="button"
                  className="w-full"
                  disabled={!isFormValid() || isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? "Joining..." : "Join ClearMarket"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {!isFormValid() && (
                  <p className="text-xs text-muted-foreground text-center">
                    Please complete all required fields and agree to receive updates
                  </p>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Join {emailCount}+ professionals already signed up
              </p>
            </Card>
          ) : (
            <Card className="max-w-2xl mx-auto p-8 shadow-elevated bg-accent/10 border-accent/20">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-accent mb-2">
                  You're on the list!
                </h3>
                <p className="text-accent/80 mb-4">
                  We'll notify you as soon as ClearMarket launches. Thanks for your interest!
                </p>
                <Badge className="bg-accent/20 text-accent">
                  {userPosition.fullUsername || `Member ${emailCount + 1}`}
                </Badge>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Built for Field Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature designed with field representatives and vendors in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Coverage Mapping</h3>
              <p className="text-muted-foreground">
                Automatically match field reps with vendors based on location and availability
              </p>
            </Card>

            <Card className="p-6 text-center">
              <Shield className="h-12 w-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trust & Verification</h3>
              <p className="text-muted-foreground">
                Built-in verification systems and reputation scoring for reliable partnerships
              </p>
            </Card>

            <Card className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Credit-Based System</h3>
              <p className="text-muted-foreground">
                Fair, transparent pricing with no hidden fees or subscription costs
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <ClearMarketLogo />
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
  );
};

export default Prelaunch;
