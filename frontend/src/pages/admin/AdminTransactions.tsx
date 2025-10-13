import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const AdminTransactions = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['adminTransactions'],
    queryFn: async () => {
      const response = await api.get('/admin/transactions');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Transactions</h2>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : !transactions || transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">No transactions</TableCell>
                </TableRow>
              ) : (
                transactions.map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>#{tx.id}</TableCell>
                    <TableCell>{tx.user_id}</TableCell>
                    <TableCell className="capitalize">{tx.transaction_type}</TableCell>
                    <TableCell>{tx.amount.toLocaleString()}</TableCell>
                    <TableCell>{tx.currency}</TableCell>
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
    </div>
  );
};

export default AdminTransactions;
