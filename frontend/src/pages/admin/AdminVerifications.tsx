import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AdminVerification } from '@/lib/admin-types';

const AdminVerifications = () => {
  const [selectedVerification, setSelectedVerification] = useState<AdminVerification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  const { data: verifications, isLoading } = useQuery<AdminVerification[]>({
    queryKey: ['adminVerifications'],
    queryFn: async () => {
      const response = await api.get('/admin/verifications');
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/admin/verifications/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerifications'] });
      toast.success('Verification approved');
      setDetailsOpen(false);
    },
    onError: () => {
      toast.error('Failed to approve verification');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      await api.post(`/admin/verifications/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminVerifications'] });
      toast.success('Verification rejected');
      setDetailsOpen(false);
      setRejectionReason('');
    },
    onError: () => {
      toast.error('Failed to reject verification');
    },
  });

  const handleViewDetails = (verification: AdminVerification) => {
    setSelectedVerification(verification);
    setDetailsOpen(true);
  };

  const handleApprove = () => {
    if (selectedVerification) {
      approveMutation.mutate(selectedVerification.id);
    }
  };

  const handleReject = () => {
    if (selectedVerification && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedVerification.id, reason: rejectionReason });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Document Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : !verifications || verifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No verification requests
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((verification) => (
                <TableRow key={verification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{verification.user_name}</div>
                      <div className="text-sm text-muted-foreground">{verification.user_email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{verification.document_type.replace('_', ' ')}</TableCell>
                  <TableCell>{verification.document_number}</TableCell>
                  <TableCell>
                    <Badge variant={verification.status === 'approved' ? 'default' : verification.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {verification.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(verification.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleViewDetails(verification)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Verification Details</DialogTitle>
            <DialogDescription>Review and manage user verification request</DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedVerification.user_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVerification.user_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedVerification.status === 'approved' ? 'default' : selectedVerification.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {selectedVerification.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{selectedVerification.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Document Type</Label>
                  <p className="font-medium capitalize">{selectedVerification.document_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Document Number</Label>
                  <p className="font-medium">{selectedVerification.document_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-medium">{new Date(selectedVerification.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedVerification.rejection_reason && (
                <div>
                  <Label className="text-muted-foreground">Rejection Reason</Label>
                  <p className="text-sm mt-1">{selectedVerification.rejection_reason}</p>
                </div>
              )}

              {selectedVerification.status === 'pending' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button onClick={handleApprove} disabled={approveMutation.isPending}>
                      {approveMutation.isPending ? 'Approving...' : 'Approve Verification'}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rejection">Rejection Reason</Label>
                    <Textarea
                      id="rejection"
                      placeholder="Enter reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || rejectMutation.isPending}
                    >
                      {rejectMutation.isPending ? 'Rejecting...' : 'Reject Verification'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminVerifications;
