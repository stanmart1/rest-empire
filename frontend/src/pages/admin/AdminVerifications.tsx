import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { AdminVerification } from '@/lib/admin-types';

const AdminVerifications = () => {
  const { data: verifications, isLoading } = useQuery<AdminVerification[]>({
    queryKey: ['adminVerifications'],
    queryFn: async () => {
      const response = await api.get('/admin/verifications');
      return response.data;
    },
  });

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
                    {verification.status === 'pending' && (
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
      </CardContent>
    </Card>
  );
};

export default AdminVerifications;
