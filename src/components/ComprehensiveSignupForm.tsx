import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserCheck, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
interface ComprehensiveSignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
  loading: boolean;
}
export interface SignupFormData {
  email: string;
  password: string;
  userRole: 'field-rep' | 'vendor';
  experienceLevel?: string;
  primaryState?: string;
  workTypes?: string[];
  currentChallenges?: string;
  interestedFeatures?: string;
}
const EXPERIENCE_LEVELS = ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'];
const STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
const WORK_TYPES = ['Interior/Exterior Inspections', 'Drive-by Inspections', 'REO Services', 'Damage Assessment', 'Appt-Based Inspections', 'Exterior Only Inspections', 'Occupancy Verification', 'Property Preservation', 'High Quality Marketing Photos'];
export const ComprehensiveSignupForm = ({
  onSubmit,
  loading
}: ComprehensiveSignupFormProps) => {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    userRole: 'field-rep',
    experienceLevel: '',
    primaryState: '',
    workTypes: [],
    currentChallenges: '',
    interestedFeatures: ''
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };
  const toggleWorkType = (workType: string) => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes?.includes(workType) ? prev.workTypes.filter(t => t !== workType) : [...(prev.workTypes || []), workType]
    }));
  };
  const selectAllWorkTypes = () => {
    setFormData(prev => ({
      ...prev,
      workTypes: prev.workTypes?.length === WORK_TYPES.length ? [] : WORK_TYPES
    }));
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Role Selection */}
      <div className="space-y-3">
        <Label className="text-base">I am a: <span className="text-destructive">*</span></Label>
        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={() => setFormData(prev => ({
          ...prev,
          userRole: 'field-rep'
        }))} className={cn("relative p-6 rounded-lg border-2 transition-all text-center", formData.userRole === 'field-rep' ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/50")}>
            <UserCheck className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">Field Rep</div>
            <div className="text-sm text-muted-foreground">Looking for work</div>
          </button>
          
          <button type="button" onClick={() => setFormData(prev => ({
          ...prev,
          userRole: 'vendor'
        }))} className={cn("relative p-6 rounded-lg border-2 transition-all text-center", formData.userRole === 'vendor' ? "border-accent bg-accent text-white" : "border-border bg-card hover:border-accent/50")}>
            <Building className="h-8 w-8 mx-auto mb-2" />
            <div className="font-semibold">Vendor</div>
            <div className="text-sm opacity-90">Seeking coverage</div>
          </button>
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
        <Input id="email" type="email" placeholder="your.email@company.com" value={formData.email} onChange={e => setFormData(prev => ({
        ...prev,
        email: e.target.value
      }))} required className="bg-background" />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
        <Input id="password" type="password" placeholder="Create a secure password" value={formData.password} onChange={e => setFormData(prev => ({
        ...prev,
        password: e.target.value
      }))} required minLength={6} className="bg-background" />
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <Label htmlFor="experience">Experience Level</Label>
        <Select value={formData.experienceLevel} onValueChange={value => setFormData(prev => ({
        ...prev,
        experienceLevel: value
      }))}>
          <SelectTrigger id="experience" className="bg-background">
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            {EXPERIENCE_LEVELS.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Primary State */}
      <div className="space-y-2">
        <Label htmlFor="state">Primary State</Label>
        <Select value={formData.primaryState} onValueChange={value => setFormData(prev => ({
        ...prev,
        primaryState: value
      }))}>
          <SelectTrigger id="state" className="bg-background">
            <SelectValue placeholder="Select your primary state" />
          </SelectTrigger>
          <SelectContent>
            {STATES.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
          </SelectContent>
        </Select>
        {formData.primaryState && <p className="text-sm text-muted-foreground">Please select your primary state</p>}
      </div>

      {/* Type of Work */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Type of Work</Label>
          <button type="button" onClick={selectAllWorkTypes} className="text-sm text-primary hover:underline">
            {formData.workTypes?.length === WORK_TYPES.length ? 'Deselect all' : 'Select all that apply'}
          </button>
        </div>
        <div className="space-y-2 p-4 rounded-lg border border-border bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WORK_TYPES.map(workType => <div key={workType} className="flex items-center space-x-2">
                <Checkbox id={workType} checked={formData.workTypes?.includes(workType)} onCheckedChange={() => toggleWorkType(workType)} />
                <label htmlFor={workType} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  {workType}
                </label>
              </div>)}
          </div>
          {formData.workTypes && formData.workTypes.length === 0 && <p className="text-sm text-muted-foreground mt-2">Please select at least one work type</p>}
        </div>
      </div>

      {/* Current Challenges */}
      <div className="space-y-2">
        <Label htmlFor="challenges">Current Challenges</Label>
        <Textarea id="challenges" placeholder="What are your biggest challenges in finding work/coverage? (e.g., finding reliable professionals, inconsistent work, payment delays, etc.)" value={formData.currentChallenges} onChange={e => setFormData(prev => ({
        ...prev,
        currentChallenges: e.target.value
      }))} className="min-h-[80px] bg-background resize-none" />
      </div>

      {/* Most Interested Features */}
      <div className="space-y-2">
        <Label htmlFor="features">Most Interested Features</Label>
        <Textarea id="features" placeholder="Which features are you most excited about? (e.g., trust scores, coverage mapping, direct messaging, credit system, etc.)" value={formData.interestedFeatures} onChange={e => setFormData(prev => ({
        ...prev,
        interestedFeatures: e.target.value
      }))} className="min-h-[80px] bg-background resize-none" />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-white h-12 text-base font-semibold" disabled={loading}>
        {loading ? <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Creating your account...
          </> : 'Join ClearMarket'}
      </Button>

      
    </form>;
};