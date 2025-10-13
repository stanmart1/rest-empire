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
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <p className="text-center">Loading...</p>
            ) : !bonuses || bonuses.length === 0 ? (
              <p className="text-center text-muted-foreground">No bonuses</p>
            ) : (
              bonuses.map((bonus: any) => (
                <div key={bonus.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">User ID: {bonus.user_id}</p>
                      <p className="text-sm text-muted-foreground capitalize">{bonus.bonus_type}</p>
                    </div>
                    <Badge variant={bonus.status === 'paid' ? 'default' : 'secondary'}>{bonus.status}</Badge>
                  </div>
                  <p className="text-lg font-semibold">₦{bonus.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{new Date(bonus.created_at).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBonuses;
