import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Check, ChevronsUpDown, X } from 'lucide-react';
import { useSearchUsers } from '@/hooks/useAdminUsers';
import { useAssignPackage } from '@/hooks/useAdminActivation';
import { cn } from '@/lib/utils';

interface AssignPackageModalProps {
  open: boolean;
  onClose: () => void;
  packageId: number;
  packageName: string;
}

const AssignPackageModal = ({ open, onClose, packageId, packageName }: AssignPackageModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Array<{ id: number; email: string; full_name: string }>>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { data: searchResults, isLoading: searching } = useSearchUsers(searchQuery);
  const assignMutation = useAssignPackage();

  const handleSelectUser = (user: any) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleAssign = () => {
    if (selectedUsers.length === 0) return;
    
    assignMutation.mutate(
      { packageId, userIds: selectedUsers.map(u => u.id) },
      {
        onSuccess: () => {
          setSelectedUsers([]);
          setSearchQuery('');
          onClose();
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Package: {packageName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Select Users</Label>
            <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={dropdownOpen}
                  className="w-full justify-between mt-2"
                >
                  Search users...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search by name or email..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {searching && (
                      <div className="py-6 text-center text-sm">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      </div>
                    )}
                    {!searching && searchQuery.length < 2 && (
                      <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
                    )}
                    {!searching && searchQuery.length >= 2 && (!searchResults || searchResults.length === 0) && (
                      <CommandEmpty>No users found</CommandEmpty>
                    )}
                    {searchResults && searchResults.length > 0 && (
                      <CommandGroup>
                        {searchResults.map((user: any) => (
                          <CommandItem
                            key={user.id}
                            value={user.email}
                            onSelect={() => {
                              handleSelectUser(user);
                              setDropdownOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedUsers.find(u => u.id === user.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{user.full_name || user.email}</span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedUsers.length > 0 && (
            <div>
              <Label>Selected Users ({selectedUsers.length})</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="pr-1">
                    {user.full_name || user.email}
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selectedUsers.length === 0 || assignMutation.isPending}
            className="flex-1"
          >
            {assignMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign to {selectedUsers.length} User{selectedUsers.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPackageModal;
