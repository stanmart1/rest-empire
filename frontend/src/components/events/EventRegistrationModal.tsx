import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { Event } from '@/types/events';
import { useToast } from '@/hooks/use-toast';

interface EventRegistrationModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventId: number) => Promise<any>;
  isSubmitting: boolean;
  defaultData?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const EventRegistrationModal = ({
  event,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultData,
}: EventRegistrationModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });
  const [registrationCode, setRegistrationCode] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (defaultData) {
      setFormData(defaultData);
    }
  }, [defaultData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (event) {
      try {
        const response = await onSubmit(event.id);
        const code = `EVT-${event.id}-USR-${response?.user_id || ''}`;
        setRegistrationCode(code);
        setShowSuccess(true);
      } catch (error) {
        // Error handled by parent
      }
    }
  };

  const copyCode = () => {
    if (registrationCode) {
      navigator.clipboard.writeText(registrationCode);
      toast({ title: 'Copied!', description: 'Registration code copied to clipboard' });
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setRegistrationCode(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>
            Please confirm your details to register for {event?.title}
          </DialogDescription>
        </DialogHeader>
        {showSuccess && registrationCode ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully registered! Save your registration code below.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Your Registration Code</Label>
              <div className="flex gap-2">
                <Input value={registrationCode} readOnly className="font-mono" />
                <Button type="button" variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Show this code at the event entrance or use it for manual check-in.
              </p>
            </div>
            
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
