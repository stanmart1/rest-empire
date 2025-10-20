import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Trash2, Plus, X } from 'lucide-react';
import { Role, Permission } from '@/types/rbac';
import { useRoles, usePermissions, useCreateRole, useDeleteRole, useUpdateRolePermissions } from '@/hooks/useRbac';
import { useAuth } from '@/contexts/AuthContext';
import { forwardRef, useImperativeHandle } from 'react';

interface RoleManagementProps {
  deleteMode: boolean;
  setDeleteMode: (value: boolean) => void;
  selectedRoles: number[];
  setSelectedRoles: (value: number[]) => void;
}

export interface RoleManagementRef {
  openCreateModal: () => void;
  openBulkDeleteDialog: () => void;
}

const RoleManagement = forwardRef<RoleManagementRef, RoleManagementProps>(({ deleteMode, setDeleteMode, selectedRoles, setSelectedRoles }, ref) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({ name: '', display_name: '', description: '', permission_ids: [] as number[] });
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);

  const { user } = useAuth();
  const { data: allRoles, isLoading: rolesLoading } = useRoles();
  const { data: permissions } = usePermissions();
  const createRoleMutation = useCreateRole();
  const deleteRoleMutation = useDeleteRole();
  const updatePermissionsMutation = useUpdateRolePermissions();

  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'superadmin';
  const roles = allRoles?.filter(role => isSuperAdmin || role.name !== 'super_admin');

  const handleOpenPermissions = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map(p => p.id) || []);
    setPermissionsModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const toggleRoleSelection = (roleId: number) => {
    setSelectedRoles(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openCreateModal: () => setCreateModalOpen(true),
    openBulkDeleteDialog: handleBulkDelete
  }));

  const confirmBulkDelete = async () => {
    for (const roleId of selectedRoles) {
      await deleteRoleMutation.mutateAsync(roleId);
    }
    setSelectedRoles([]);
    setDeleteMode(false);
    setDeleteDialogOpen(false);
  };

  const handleSavePermissions = () => {
    if (selectedRole) {
      updatePermissionsMutation.mutate(
        { roleId: selectedRole.id, permissions: selectedPermissions },
        { onSuccess: () => setPermissionsModalOpen(false) }
      );
    }
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const groupedPermissions = permissions?.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-4">

      {rolesLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles?.map((role) => (
            <Card 
              key={role.id}
              className={deleteMode && selectedRoles.includes(role.id) ? 'ring-2 ring-primary' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {deleteMode && role.name !== 'super_admin' ? (
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={() => toggleRoleSelection(role.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{role.display_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{role.display_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                      </div>
                      {!deleteMode && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenPermissions(role)}
                            className="h-8 w-8"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          {role.name !== 'super_admin' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(role)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <span className="text-muted-foreground">Permissions: </span>
                  <span className="font-medium">{role.permissions?.length || 0}</span>
                </div>
                {role.is_system && (
                  <div className="mt-2">
                    <Badge variant="secondary">System Role</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Role Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="e.g., content_manager"
              />
            </div>
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={newRole.display_name}
                onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                placeholder="e.g., Content Manager"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Role description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => createRoleMutation.mutate(newRole, {
              onSuccess: () => {
                setCreateModalOpen(false);
                setNewRole({ name: '', display_name: '', description: '', permission_ids: [] });
              }
            })}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog open={permissionsModalOpen} onOpenChange={setPermissionsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Permissions - {selectedRole?.display_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {groupedPermissions && Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource}>
                <h3 className="font-semibold mb-3 capitalize">{resource}</h3>
                <div className="space-y-2">
                  {perms.map((perm) => (
                    <div key={perm.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${perm.id}`}
                        checked={selectedPermissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                      />
                      <label
                        htmlFor={`perm-${perm.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {perm.name}
                        <span className="text-muted-foreground ml-2">- {perm.description}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePermissions}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role{selectedRoles.length > 1 ? 's' : ''}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRoles.length > 0 ? (
                `Are you sure you want to delete ${selectedRoles.length} role(s)? This action cannot be undone.`
              ) : (
                `Are you sure you want to delete the role "${roleToDelete?.display_name}"? This action cannot be undone.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedRoles.length > 0) {
                  confirmBulkDelete();
                } else if (roleToDelete) {
                  deleteRoleMutation.mutate(roleToDelete.id, {
                    onSuccess: () => {
                      setDeleteDialogOpen(false);
                      setRoleToDelete(null);
                    }
                  });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default RoleManagement;
