import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const AdminBonuses = () => {
  const { data: bonuses, isLoading } = useQuery({
    queryKey: ['adminBonuses'],
    queryFn: async () => {
      const response = await api.get('/admin/bonuses');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Bonus Management</h2>

      <Card>
        <CardHeader>
          <CardTitle>All Bonuses</CardTitle>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : !bonuses || bonuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No bonuses</TableCell>
                </TableRow>
              ) : (
                bonuses.map((bonus: any) => (
                  <TableRow key={bonus.id}>
                    <TableCell>{bonus.user_id}</TableCell>
                    <TableCell className="capitalize">{bonus.bonus_type}</TableCell>
                    <TableCell>₦{bonus.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={bonus.status === 'paid' ? 'default' : 'secondary'}>{bonus.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(bonus.created_at).toLocaleDateString()}</TableCell>
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

export default AdminBonuses;
