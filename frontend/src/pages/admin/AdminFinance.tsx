import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const AdminFinance = () => {
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['adminTransactions'],
    queryFn: async () => {
      const response = await api.get('/admin/transactions');
      return response.data;
    },
  });

  const { data: payouts, isLoading: payoutsLoading } = useQuery({
    queryKey: ['adminPayouts'],
    queryFn: async () => {
      const response = await api.get('/admin/payouts');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Finance Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : !transactions || transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No transactions</TableCell>
                  </TableRow>
                ) : (
                  transactions.slice(0, 10).map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell>{tx.user_id}</TableCell>
                      <TableCell className="capitalize">{tx.transaction_type}</TableCell>
                      <TableCell>₦{tx.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>{tx.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {transactionsLoading ? (
              <p className="text-center">Loading...</p>
            ) : !transactions || transactions.length === 0 ? (
              <p className="text-center text-muted-foreground">No transactions</p>
            ) : (
              transactions.slice(0, 10).map((tx: any) => (
                <div key={tx.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">User ID: {tx.user_id}</p>
                      <p className="text-sm text-muted-foreground capitalize">{tx.transaction_type}</p>
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>{tx.status}</Badge>
                  </div>
                  <p className="text-lg font-semibold">₦{tx.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : !payouts || payouts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">No payouts</TableCell>
                  </TableRow>
                ) : (
                  payouts.slice(0, 10).map((payout: any) => (
                    <TableRow key={payout.id}>
                      <TableCell>{payout.user_id}</TableCell>
                      <TableCell>₦{payout.amount.toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{payout.payout_method?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>{payout.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(payout.requested_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {payoutsLoading ? (
              <p className="text-center">Loading...</p>
            ) : !payouts || payouts.length === 0 ? (
              <p className="text-center text-muted-foreground">No payouts</p>
            ) : (
              payouts.slice(0, 10).map((payout: any) => (
                <div key={payout.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">User ID: {payout.user_id}</p>
                    <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>{payout.status}</Badge>
                  </div>
                  <p className="text-lg font-semibold">₦{payout.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground capitalize">{payout.payout_method?.replace('_', ' ')}</p>
                  <p className="text-sm text-muted-foreground">{new Date(payout.requested_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;
