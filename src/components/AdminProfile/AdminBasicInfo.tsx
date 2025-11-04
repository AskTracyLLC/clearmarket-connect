
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Calendar, Shield, Crown, Edit3, Save, X, MapPin, Phone } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

const adminProfileSchema = z.object({
  firstName: z.string().trim().max(50, "First name must be less than 50 characters").optional(),
  lastName: z.string().trim().max(50, "Last name must be less than 50 characters").optional(),
  city: z.string().trim().max(100, "City must be less than 100 characters").optional(),
  state: z.string().length(2, "State must be 2 characters").optional(),
  phone: z.string().trim().regex(/^[\d\s\-\(\)\+\.]+$/, "Invalid phone number format").max(20, "Phone number must be less than 20 characters").optional().or(z.literal('')),
  displayName: z.string().trim().min(1, "Display name cannot be empty").max(50, "Display name must be less than 50 characters"),
  bio: z.string().trim().max(500, "Bio must be less than 500 characters").optional(),
});

// US States for dropdown
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

interface AdminBasicInfoProps {
  profile: any;
  user: any;
}

export const AdminBasicInfo = ({ profile, user }: AdminBasicInfoProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadProfileData();
  }, [profile, user]);

  const loadProfileData = async () => {
    if (!user?.id) return;

    try {
      // Fetch user profile data
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, city, state, phone')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      }

      setFirstName(profileData?.first_name || '');
      setLastName(profileData?.last_name || '');
      setCity(profileData?.city || '');
      setState(profileData?.state || '');
      setPhone(profileData?.phone || '');
      setDisplayName(profile?.display_name || profile?.anonymous_username || '');
      setBio('System Administrator with full platform access and oversight responsibilities.');
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Validate form data
      const validationResult = adminProfileSchema.safeParse({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        city: city || undefined,
        state: state || undefined,
        phone: phone || undefined,
        displayName,
        bio: bio || undefined,
      });

      if (!validationResult.success) {
        const validationErrors: Record<string, string> = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0]) {
            validationErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(validationErrors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive"
        });
        return;
      }

      setErrors({});
      setIsSaving(true);

      // Update user_profiles table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          city: city.trim() || null,
          state: state || null,
          phone: phone.trim() || null,
          email: user.email,
        }, {
          onConflict: 'user_id'
        });

      if (profileError) throw profileError;

      // Update display name in users table
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          display_name: displayName.trim()
        })
        .eq('id', user.id);

      if (userError) throw userError;

      toast({
        title: "Profile Updated",
        description: "Your admin profile has been updated successfully."
      });
      
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadProfileData();
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="first-name">First Name</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      maxLength={50}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive mt-1">{errors.firstName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm mt-1 p-2 bg-muted rounded">{firstName || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="last-name">Last Name</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      maxLength={50}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive mt-1">{errors.lastName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm mt-1 p-2 bg-muted rounded">{lastName || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="city">City</Label>
                {isEditing ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Enter city"
                        maxLength={100}
                        className="flex-1"
                      />
                    </div>
                    {errors.city && (
                      <p className="text-xs text-destructive mt-1">{errors.city}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{city || 'Not set'}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="state">State</Label>
                {isEditing ? (
                  <div>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state && (
                      <p className="text-xs text-destructive mt-1">{errors.state}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm mt-1 p-2 bg-muted rounded">{state || 'Not set'}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        maxLength={20}
                        className="flex-1"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{phone || 'Not set'}</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="display-name">Display Name</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter display name"
                      maxLength={50}
                    />
                    {errors.displayName && (
                      <p className="text-xs text-destructive mt-1">{errors.displayName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm mt-1 p-2 bg-muted rounded">{displayName || profile?.anonymous_username || 'Not set'}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Display name defaults to your anonymous username</p>
              </div>

              <div>
                <Label>Anonymous Username</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm p-2 bg-muted rounded flex-1">{profile?.anonymous_username}</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{user?.email}</p>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Account Created</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {user?.created_at ? format(new Date(user.created_at), 'MMMM d, yyyy') : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Administrative Bio</Label>
                {isEditing ? (
                  <div>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Describe your administrative role and responsibilities"
                      rows={6}
                      maxLength={500}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {bio.length}/500 characters
                    </p>
                    {errors.bio && (
                      <p className="text-xs text-destructive mt-1">{errors.bio}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm mt-1 p-3 bg-muted rounded">{bio || 'No bio set'}</p>
                )}
              </div>

              <div>
                <Label>Role & Permissions</Label>
                <div className="space-y-2 mt-1">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">System Administrator</span>
                    <Badge className="bg-purple-100 text-purple-700">Full Access</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Platform Oversight</span>
                    <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label>Trust Score</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full w-full"></div>
                  </div>
                  <span className="text-sm font-medium">100/100</span>
                  <Badge variant="default">Maximum</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
