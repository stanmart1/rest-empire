import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AdminUser } from '@/lib/admin-types';
import { usePermission } from '@/hooks/usePermission';
import { useRoles, useUserRoles, useAssignUserRoles } from '@/hooks/useRbac';

interface UserDetailsModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ user, open, onClose }: UserDetailsModalProps) => {
  const { hasPermission } = usePermission();
  const canAssignRoles = hasPermission('users:assign_roles');
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

  const { data: allRoles } = useRoles();
  const { data: userRoles } = useUserRoles(user?.id, canAssignRoles);
  const assignRolesMutation = useAssignUserRoles();

  useEffect(() => {
    if (userRoles) {
      setSelectedRoles(userRoles.map(r => r.id));
    }
  }, [userRoles]);

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSaveRoles = () => {
    if (user?.id) {
      assignRolesMutation.mutate(
        { userId: user.id, roleIds: selectedRoles },
        {
          onSuccess: () => {
            setIsEditingRoles(false);
          },
        }
      );
    }
  };

  const handleCancelEdit = () => {
    setSelectedRoles(userRoles?.map(r => r.id) || []);
    setIsEditingRoles(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View and manage user information</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <p className="font-medium">{user.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rank</p>
              <p className="font-medium">{user.current_rank}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={user.is_active ? 'default' : 'secondary'}>
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <Badge variant={user.is_verified ? 'default' : 'secondary'}>
                {user.is_verified ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance (NGN)</p>
              <p className="font-medium">₦{user.balance_ngn.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance (USDT)</p>
              <p className="font-medium">${user.balance_usdt.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Date</p>
              <p className="font-medium">{new Date(user.registration_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sponsor ID</p>
              <p className="font-medium">{user.sponsor_id || 'N/A'}</p>
            </div>
          </div>

          {canAssignRoles && (
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base">Assigned Roles</Label>
                {!isEditingRoles ? (
                  <Button size="sm" onClick={() => setIsEditingRoles(true)}>
                    Edit Roles
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSaveRoles}
                      disabled={assignRolesMutation.isPending}
                    >
                      {assignRolesMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>

              {!isEditingRoles ? (
                <div className="flex flex-wrap gap-2">
                  {userRoles && userRoles.length > 0 ? (
                    userRoles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.display_name}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                  )}
                </div>
              ) : (
                <div className="border rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                  {allRoles && allRoles.length > 0 ? (
                    allRoles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-role-${role.id}`}
                          checked={selectedRoles.includes(role.id)}
                          onCheckedChange={() => handleRoleToggle(role.id)}
                        />
                        <Label htmlFor={`edit-role-${role.id}`} className="cursor-pointer font-normal">
                          {role.display_name}
                          {role.description && (
                            <span className="text-xs text-muted-foreground ml-2">
                              - {role.description}
                            </span>
                          )}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No roles available</p>
                  )}
                </div>
              )}
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
