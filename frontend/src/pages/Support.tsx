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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import apiService from '@/services/api';

const Support = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: ''
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
            If you have any issues with the Rest Empire platform, we recommend seeking advice from your sponsor or team leader. Our community members learn fast and can help each other.
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
              <Textarea
                id="message"
                placeholder="Please provide details about your inquiry..."
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
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
    </div>
  );
};

export default Support;
