import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { AdminPayout } from '@/lib/admin-types';

const AdminPayouts = () => {
  const { data: payouts, isLoading } = useQuery<AdminPayout[]>({
    queryKey: ['adminPayouts'],
    queryFn: async () => {
      const response = await api.get('/admin/payouts');
      return response.data;
    },
  });

  return (
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
                      {payout.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="default">Approve</Button>
                          <Button size="sm" variant="destructive">Reject</Button>
                        </div>
                      )}
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
                {payout.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" className="flex-1">Approve</Button>
                    <Button size="sm" variant="destructive" className="flex-1">Reject</Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPayouts;
