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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  
  const updateProfileMutation = useMutation({
    mutationFn: (data: { full_name?: string; phone_number?: string }) =>
      apiService.user.updateProfile(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
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
    });
  };

  return (
    <div className="space-y-8">
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

      {/* Personal Details & Job Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Personal Details</h2>
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
                  className="mt-2 border-0 border-b rounded-none bg-muted" 
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Gender</Label>
                <Select>
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
                  <Input placeholder="Date of birth" className="pl-8 border-0 border-b rounded-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Job & Career</h2>
          <Card>
            <CardContent className="p-6">
              <Label className="text-muted-foreground">Position</Label>
              <Select>
                <SelectTrigger className="mt-2 border-0 border-b rounded-none">
                  <SelectValue placeholder="Select a position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location & Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Location</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-muted-foreground">Country</Label>
                <Select>
                  <SelectTrigger className="mt-2 border-0 border-b rounded-none">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">City</Label>
                <Input placeholder="City" className="mt-2 border-0 border-b rounded-none" />
              </div>
              <Input placeholder="Address 1" className="border-0 border-b rounded-none" />
              <Input placeholder="Address 2" className="border-0 border-b rounded-none" />
              <Input placeholder="ZIP code" className="border-0 border-b rounded-none" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Contact Details</h2>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Phone className="absolute left-0 top-3 h-5 w-5 text-success" />
                <Input 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number" 
                  className="pl-8 border-0 border-b rounded-none" 
                />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-0 top-3 h-5 w-5 text-green-500" />
                <Input placeholder="WhatsApp" className="pl-8 border-0 border-b rounded-none" />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-0 top-3 h-5 w-5 text-blue-400" />
                <Input placeholder="Telegram" className="pl-8 border-0 border-b rounded-none" />
              </div>
              <div className="relative">
                <Users className="absolute left-0 top-3 h-5 w-5 text-blue-600" />
                <Input placeholder="Facebook" className="pl-8 border-0 border-b rounded-none" />
              </div>
              <div className="relative">
                <Globe className="absolute left-0 top-3 h-5 w-5 text-blue-500" />
                <Input placeholder="Website" className="pl-8 border-0 border-b rounded-none" />
              </div>
            </CardContent>
          </Card>
        </div>
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
