import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AdminUser } from '@/lib/admin-types';

interface UserDetailsModalProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ user, open, onClose }: UserDetailsModalProps) => {
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
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
