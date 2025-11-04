import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import apiService from '@/services/api';

interface Ticket {
  id: number;
  subject: string;
  category: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  responses?: Array<{
    id: number;
    message: string;
    created_at: string;
    author: { full_name: string };
  }>;
}

const Support = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: ''
  });
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { data: tickets } = useQuery<Ticket[]>({
    queryKey: ['userTickets'],
    queryFn: async () => {
      const response = await apiService.support.getTickets();
      return response;
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: { subject: string; category: string; message: string }) =>
      apiService.support.createTicket(data),
    onSuccess: (data) => {
      toast({
        title: "Ticket Created",
        description: `Your support ticket #${data.ticket_id} has been submitted successfully.`,
      });
      setFormData({ subject: '', category: 'general', message: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to submit support ticket",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.subject.trim() && formData.message.trim()) {
      submitMutation.mutate(formData);
    }
  };

  const faqCategories = [
    {
      title: "Change passport/address/phone",
      content: "To update your personal information including passport, address, or phone number, please contact your sponsor or team leader directly. They will guide you through the verification process required for security purposes."
    },
    {
      title: "Change your e-mail address",
      content: "Email changes require verification for security. Please submit a request through your account settings or contact support with your current email and the new email address you'd like to use. Verification links will be sent to both addresses."
    },
    {
      title: "Question about bonuses",
      content: "Bonus calculations are based on your rank, team performance, and active status. Direct bonuses are paid at 40% for Level 1, with decreasing percentages for subsequent levels. Rank bonuses are one-time payments awarded when achieving new ranks. For specific bonus questions, please refer to your bonus dashboard or contact your sponsor."
    },
    {
      title: "Questions about verification",
      content: "Account verification typically takes 24-48 hours after submitting required documents. Ensure all documents are clear, valid, and match your account information. You'll receive an email notification once verification is complete. Active verification is required to receive bonuses and payouts."
    },
    {
      title: "Account recovery, safety",
      content: "If you've lost access to your account, use the password recovery option on the login page. For additional security concerns, contact support immediately. We recommend enabling two-factor authentication and keeping your contact information up to date for account security."
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Support</h1>
        <p className="text-muted-foreground">Submit an inquiry to our support team</p>
      </div>

      {/* FAQ Section */}
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-6">
            If you have any issues with the Opened Seal and Rest Empire platform, we recommend seeking advice from your sponsor or team leader. Our community members learn fast and can help each other.
          </p>

          <Accordion type="single" collapsible className="w-full">
            {faqCategories.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left hover:no-underline">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* My Tickets */}
      {tickets && tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Tickets</CardTitle>
            <CardDescription>View your support ticket history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => {
                  setSelectedTicket(ticket);
                  setDetailsOpen(true);
                }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">#{ticket.id}</span>
                      <Badge variant={ticket.status === 'closed' ? 'default' : 'secondary'}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Send us a message and our support team will get back to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="account">Account Issues</SelectItem>
                  <SelectItem value="payment">Payment & Payouts</SelectItem>
                  <SelectItem value="bonus">Bonus Questions</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <RichTextEditor
                id="message"
                placeholder="Please provide details about your inquiry..."
                value={formData.message}
                onChange={(value) => setFormData({ ...formData, message: value })}
                minHeight="200px"
              />
            </div>
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Submit Inquiry'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id} - {selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={selectedTicket.status === 'closed' ? 'default' : 'secondary'}>
                  {selectedTicket.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedTicket.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Your Message</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Responses</p>
                    {selectedTicket.responses.map((response) => (
                      <div key={response.id} className="p-4 bg-primary/10 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{response.author.full_name} (Support)</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{response.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Support;
