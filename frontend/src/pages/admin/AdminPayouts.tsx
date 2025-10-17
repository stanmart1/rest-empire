import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { AdminPayout } from '@/types/admin-payouts';
import { usePayouts, useApprovePayout, useRejectPayout } from '@/hooks/useAdminPayouts';

const AdminPayouts = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayout | null>(null);
  
  const approveMutation = useApprovePayout({
    onSuccess: () => setDetailsOpen(false),
  });
  const rejectMutation = useRejectPayout({
    onSuccess: () => setDetailsOpen(false),
  });
  const { data: payouts, isLoading } = usePayouts();

  const handleViewDetails = (payout: AdminPayout) => {
    setSelectedPayout(payout);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : !payouts || payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No payout requests
                    </TableCell>
                  </TableRow>
                ) : (
                  payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payout.user_name}</div>
                          <div className="text-sm text-muted-foreground">{payout.user_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payout.currency === 'NGN' ? '₦' : '$'}{payout.amount.toLocaleString()}</TableCell>
                      <TableCell>{payout.currency}</TableCell>
                      <TableCell className="capitalize">{payout.payout_method.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={payout.status === 'completed' ? 'default' : payout.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(payout.requested_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(payout)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <p className="text-center">Loading...</p>
            ) : !payouts || payouts.length === 0 ? (
              <p className="text-center text-muted-foreground">No payout requests</p>
            ) : (
              payouts.map((payout) => (
                <div key={payout.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{payout.user_name}</p>
                      <p className="text-sm text-muted-foreground">{payout.user_email}</p>
                    </div>
                    <Badge variant={payout.status === 'completed' ? 'default' : payout.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {payout.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {payout.currency === 'NGN' ? '₦' : '$'}{payout.amount.toLocaleString()} {payout.currency}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{payout.payout_method.replace('_', ' ')}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requested: {new Date(payout.requested_at).toLocaleDateString()}
                  </p>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleViewDetails(payout)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Payout Details</DialogTitle>
        </DialogHeader>
        {selectedPayout && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">User</Label>
                <p className="font-medium">{selectedPayout.user_name}</p>
                <p className="text-sm text-muted-foreground">{selectedPayout.user_email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge variant={selectedPayout.status === 'completed' ? 'default' : selectedPayout.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {selectedPayout.status}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-medium">
                  {selectedPayout.currency === 'NGN' ? '₦' : '$'}{selectedPayout.amount.toLocaleString()} {selectedPayout.currency}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Payout Method</Label>
                <p className="font-medium capitalize">{selectedPayout.payout_method.replace('_', ' ')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Requested</Label>
                <p className="font-medium">{new Date(selectedPayout.requested_at).toLocaleString()}</p>
              </div>
              {selectedPayout.processed_at && (
                <div>
                  <Label className="text-muted-foreground">Processed</Label>
                  <p className="font-medium">{new Date(selectedPayout.processed_at).toLocaleString()}</p>
                </div>
              )}
            </div>

            {selectedPayout.bank_details && (
              <div>
                <Label className="text-muted-foreground">Bank Details</Label>
                <div className="mt-2 p-4 border rounded-lg space-y-1">
                  <p className="text-sm"><span className="font-medium">Bank:</span> {selectedPayout.bank_details.bank_name}</p>
                  <p className="text-sm"><span className="font-medium">Account:</span> {selectedPayout.bank_details.account_number}</p>
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedPayout.bank_details.account_name}</p>
                </div>
              </div>
            )}

            {selectedPayout.crypto_address && (
              <div>
                <Label className="text-muted-foreground">Crypto Address</Label>
                <div className="mt-2 p-4 border rounded-lg">
                  <p className="text-sm font-mono break-all">{selectedPayout.crypto_address}</p>
                </div>
              </div>
            )}

            {selectedPayout.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={() => approveMutation.mutate(selectedPayout.id)}
                  disabled={approveMutation.isPending}
                  className="flex-1"
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve Payout
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => rejectMutation.mutate(selectedPayout.id)}
                  disabled={rejectMutation.isPending}
                  className="flex-1"
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2" />
                  )}
                  Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  );
};

export default AdminPayouts;
