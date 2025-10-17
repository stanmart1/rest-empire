import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import { SupportTicket } from '@/types/admin-support';
import { useSupportTickets, useRespondToTicket, useUpdateTicketStatus } from '@/hooks/useAdminSupport';

const AdminSupport = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const respondMutation = useRespondToTicket({
    onSuccess: () => {
      setResponseMessage('');
    },
  });
  const updateStatusMutation = useUpdateTicketStatus({
    onSuccess: () => {
      setDetailsOpen(false);
    },
  });
  const { data: tickets, isLoading } = useSupportTickets();

  const handleViewDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setDetailsOpen(true);
  };

  const handleSendResponse = () => {
    if (selectedTicket && responseMessage.trim()) {
      respondMutation.mutate({ ticketId: selectedTicket.id, message: responseMessage });
    }
  };

  const handleUpdateStatus = () => {
    if (selectedTicket && newStatus) {
      updateStatusMutation.mutate({ ticketId: selectedTicket.id, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Support Tickets</h2>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : !tickets || tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">No tickets</TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>#{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{ticket.user?.full_name || `User ${ticket.user_id}`}</div>
                          <div className="text-sm text-muted-foreground">{ticket.user?.email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'closed' ? 'default' : 'secondary'}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ticket.priority === 'high' || ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleViewDetails(ticket)}>
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
            ) : !tickets || tickets.length === 0 ? (
              <p className="text-center text-muted-foreground">No tickets</p>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">#{ticket.id}</p>
                      <p className="font-medium">{ticket.user?.full_name || `User ${ticket.user_id}`}</p>
                      <p className="text-sm text-muted-foreground">{ticket.user?.email || ''}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge variant={ticket.status === 'closed' ? 'default' : 'secondary'}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={ticket.priority === 'high' || ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1">{new Date(ticket.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => handleViewDetails(ticket)}>
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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket Details - #{selectedTicket?.id}</DialogTitle>
            <DialogDescription>View ticket information and respond to user</DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedTicket.user?.full_name || `User ${selectedTicket.user_id}`}</p>
                  <p className="text-sm text-muted-foreground">{selectedTicket.user?.email || ''}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium capitalize">{selectedTicket.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedTicket.status === 'closed' ? 'default' : 'secondary'}>
                      {selectedTicket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <div className="mt-1">
                    <Badge variant={selectedTicket.priority === 'high' || selectedTicket.priority === 'urgent' ? 'destructive' : 'secondary'}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Subject</Label>
                  <p className="font-medium">{selectedTicket.subject}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p className="text-sm">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="status">Update Status</Label>
                  <div className="flex gap-2 mt-2">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_response">Waiting Response</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleUpdateStatus} disabled={updateStatusMutation.isPending || newStatus === selectedTicket.status}>
                      {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="response">Send Response</Label>
                  <Textarea
                    id="response"
                    placeholder="Type your response to the user..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <Button
                    onClick={handleSendResponse}
                    disabled={!responseMessage.trim() || respondMutation.isPending}
                    className="mt-2"
                  >
                    {respondMutation.isPending ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSupport;
