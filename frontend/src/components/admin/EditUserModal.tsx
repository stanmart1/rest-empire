import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AdminUser } from '@/lib/admin-types';
import { useRoles, useUserRoles } from '@/hooks/useRbac';

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
  role_ids?: number[];
}

const EditUserModal = ({ user, open, onClose }: EditUserModalProps) => {
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
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
    if (userRoles) {
      setSelectedRoles(userRoles.map(r => r.id));
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
    setSelectedRoles([]);
    setShowPassword(false);
    onClose();
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
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
      role_ids: selectedRoles,
    };

    // Only include password if it's been changed
    if (formData.password) {
      updateData.password = formData.password;
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

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_verified"
                checked={formData.is_verified}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_verified: checked as boolean })
                }
              />
              <Label htmlFor="is_verified" className="cursor-pointer">
                Email Verified
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, is_active: checked as boolean })
                }
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Account Active
              </Label>
            </div>
          </div>

          {roles && roles.length > 0 && (
            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                    />
                    <Label htmlFor={`role-${role.id}`} className="cursor-pointer font-normal">
                      {role.display_name}
                      {role.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          - {role.description}
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
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
