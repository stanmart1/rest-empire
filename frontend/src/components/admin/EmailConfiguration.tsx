import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useEmailSettings, useUpdateEmailSettings, useSendTestEmail } from '@/hooks/useAdminEmail';

const EmailConfiguration = () => {
  const { data: settings, isLoading } = useEmailSettings();
  const updateMutation = useUpdateEmailSettings();
  const testEmailMutation = useSendTestEmail();

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUsername, setSmtpUsername] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [resendApiKey, setResendApiKey] = useState('');
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (settings) {
      setSmtpHost(settings.smtp_host || '');
      setSmtpPort(settings.smtp_port || 587);
      setSmtpUsername(settings.smtp_username || '');
      setSmtpPassword(settings.smtp_password || '');
      setFromEmail(settings.from_email || '');
      setFromName(settings.from_name || '');
      setResendApiKey(settings.resend_api_key || '');
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_username: smtpUsername,
      smtp_password: smtpPassword,
      from_email: fromEmail,
      from_name: fromName,
      resend_api_key: resendApiKey,
    });
  };

  const handleTestEmail = () => {
    testEmailMutation.mutate(testEmail, {
      onSuccess: () => {
        setShowTestDialog(false);
        setTestEmail('');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure email server settings</CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>SMTP Host</Label>
            <Input
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.gmail.com"
              className="mt-2"
            />
          </div>
          <div>
            <Label>SMTP Port</Label>
            <Input
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
              placeholder="587"
              className="mt-2"
            />
          </div>
        </div>
        <div>
          <Label>SMTP Username</Label>
          <Input
            value={smtpUsername}
            onChange={(e) => setSmtpUsername(e.target.value)}
            placeholder="your-email@example.com"
            className="mt-2"
          />
        </div>
        <div>
          <Label>SMTP Password</Label>
          <Input
            type="password"
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resend</CardTitle>
          <CardDescription>Configure Resend email service</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Resend API Key</Label>
            <div className="relative mt-2">
              <Input
                type={showApiKey ? "text" : "password"}
                value={resendApiKey}
                onChange={(e) => setResendApiKey(e.target.value)}
                placeholder="re_••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Email</Label>
              <Input
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="noreply@example.com"
                className="mt-2"
              />
            </div>
            <div>
              <Label>From Name</Label>
              <Input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Rest Empire"
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Email Settings
        </Button>
        <Button variant="outline" onClick={() => setShowTestDialog(true)}>
          Send Test Email
        </Button>
      </div>

      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Enter the email address where you want to send the test email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowTestDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleTestEmail} disabled={!testEmail || testEmailMutation.isPending}>
                {testEmailMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailConfiguration;
