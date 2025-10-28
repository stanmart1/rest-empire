import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AdminUser } from '@/lib/admin-types';
import { useRoles, useUserRoles } from '@/hooks/useRbac';
import { useActivationPackages } from '@/hooks/useAdminActivation';

interface EditUserModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

interface UpdateUserData {
  email?: string;
  password?: string;
  full_name?: string;
  phone_number?: string;
  is_active?: boolean;
  is_verified?: boolean;
  package_id?: number;
  role_ids?: number[];
}

const EditUserModal = ({ user, open, onClose }: EditUserModalProps) => {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone_number: '',
    is_active: true,
    is_verified: true,
  });

  const { data: roles } = useRoles();
  const { data: userRoles } = useUserRoles(user?.id, open);
  const { data: packages } = useActivationPackages();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        password: '',
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        is_active: user.is_active,
        is_verified: user.is_verified,
      });
    }
  }, [user]);

  useEffect(() => {
    if (userRoles && userRoles.length > 0) {
      setSelectedRole(userRoles[0].id.toString());
    }
  }, [userRoles]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await api.put(`/admin/users/${user?.id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['userRoles', user?.id] });
      toast.success('User updated successfully');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    },
  });

  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone_number: '',
      is_active: true,
      is_verified: true,
    });
    setSelectedRole('');
    setSelectedPackage('');
    setShowPassword(false);
    onClose();
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.full_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updateData: UpdateUserData = {
      email: formData.email,
      full_name: formData.full_name,
      phone_number: formData.phone_number,
      is_active: formData.is_active,
      is_verified: formData.is_verified,
    };

    // Only include password if it's been changed
    if (formData.password) {
      updateData.password = formData.password;
    }

    if (selectedPackage) {
      updateData.package_id = parseInt(selectedPackage);
    }

    if (selectedRole) {
      updateData.role_ids = [parseInt(selectedRole)];
    }

    updateMutation.mutate(updateData);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="+234 800 000 0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">New Password (leave blank to keep current)</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
                minLength={6}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {packages && packages.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="package">Activation Package (Optional)</Label>
              <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                <SelectTrigger id="package">
                  <SelectValue placeholder="Select activation package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id.toString()}>
                      {pkg.name} - ₦{pkg.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {roles && roles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="role">Role (Optional)</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
