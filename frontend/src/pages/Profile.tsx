import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Check, Phone, Calendar, Globe, MessageCircle, Camera, Video, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import apiService from '@/services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [gender, setGender] = useState(user?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '');
  const [occupation, setOccupation] = useState(user?.occupation || '');
  
  const updateProfileMutation = useMutation({
    mutationFn: (data: { full_name?: string; phone_number?: string; gender?: string; date_of_birth?: string; occupation?: string }) =>
      apiService.user.updateProfile(data),
    onSuccess: async () => {
      await refreshUser();
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  const handleSave = () => {
    updateProfileMutation.mutate({
      full_name: fullName,
      phone_number: phoneNumber,
      gender: gender || undefined,
      date_of_birth: dateOfBirth || undefined,
      occupation: occupation || undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Profile Photo Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-32 h-32">
                <AvatarFallback className="text-4xl bg-primary text-white">
                  {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium mb-3">Your photo must meet the following requirements:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Show account holder</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Min 300x300 pixels</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Max 10 MB size</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">JPEG, PNG format</p>
                  </div>
                </div>
              </div>
            </div>


          </CardContent>
        </Card>
      </div>

      {/* Personal Details Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Personal Details</h2>
        <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-muted-foreground">Full Name *</Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 border-0 border-b rounded-none" 
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <Input 
                  value={user?.email || ''} 
                  disabled
                  readOnly
                  className="mt-2 border-0 border-b rounded-none bg-transparent text-muted-foreground" 
                />
              </div>
              <div className="relative">
                <Label className="text-muted-foreground">Phone Number</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-0 top-3 h-5 w-5 text-success" />
                  <Input 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Phone number" 
                    className="pl-8 border-0 border-b rounded-none" 
                  />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-2 border-0 border-b rounded-none">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Label className="text-muted-foreground">Date of birth</Label>
                <div className="relative mt-2">
                  <Calendar className="absolute left-0 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    type="date" 
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    placeholder="Date of birth" 
                    className="pl-8 border-0 border-b rounded-none" 
                  />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Occupation</Label>
                <Input 
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Enter your occupation" 
                  className="mt-2 border-0 border-b rounded-none" 
                />
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateProfileMutation.isPending}
          size="lg"
        >
          {updateProfileMutation.isPending && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;
