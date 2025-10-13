import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';

const AdminSupport = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['adminTickets'],
    queryFn: async () => {
      const response = await api.get('/admin/tickets');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Support Tickets</h2>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : !tickets || tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">No tickets</TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket: any) => (
                  <TableRow key={ticket.id}>
                    <TableCell>#{ticket.id}</TableCell>
                    <TableCell>{ticket.user_id}</TableCell>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>{ticket.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={ticket.priority === 'high' ? 'destructive' : 'secondary'}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
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

export default AdminSupport;
