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
                    <TableCell>{tx.currency === 'NGN' ? '₦' : '$'}{tx.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === 'completed' ? 'default' : 'secondary'}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(tx.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
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
                    <TableCell>{payout.currency === 'NGN' ? '₦' : '$'}{payout.amount.toLocaleString()}</TableCell>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;
