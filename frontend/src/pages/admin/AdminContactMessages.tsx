import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MailOpen, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminContactMessages = () => {
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['contact-messages'],
    queryFn: async () => {
      const response = await api.get('/contact/messages');
      return response.data;
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await api.put(`/contact/messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] });
    },
  });

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
    if (!message.is_read) {
      markReadMutation.mutate(message.id);
    }
  };

  const messages: ContactMessage[] = data?.messages || [];
  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contact Messages</h2>
        <p className="text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All messages read'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Messages ({data?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id} className={!message.is_read ? 'bg-muted/50' : ''}>
                        <TableCell>
                          {message.is_read ? (
                            <MailOpen className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Mail className="h-4 w-4 text-primary" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{message.name}</TableCell>
                        <TableCell>{message.email}</TableCell>
                        <TableCell>{message.subject}</TableCell>
                        <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 space-y-2 ${!message.is_read ? 'bg-muted/50' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {message.is_read ? (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Mail className="h-4 w-4 text-primary" />
                        )}
                        <span className="font-medium">{message.name}</span>
                      </div>
                      {!message.is_read && <Badge>New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{message.email}</p>
                    <p className="text-sm font-medium">{message.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleViewMessage(message)}
                    >
                      View Message
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Message</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">From</p>
                <p className="font-medium">{selectedMessage.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="font-medium">{selectedMessage.subject}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Message</p>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                >
                  Reply via Email
                </Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContactMessages;
