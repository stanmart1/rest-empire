import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Copy, CheckCircle } from 'lucide-react';
import { Event } from '@/types/events';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

interface EventRegistrationModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventId: number, paymentData?: any) => Promise<any>;
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
  const [paymentMethod, setPaymentMethod] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [registrationCode, setRegistrationCode] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  useEffect(() => {
    apiService.payment.getMethods().then(methods => {
      if (event?.allowed_payment_methods) {
        try {
          const allowed = JSON.parse(event.allowed_payment_methods);
          setPaymentMethods(methods.filter((m: any) => allowed.includes(m.method_type)));
        } catch {
          setPaymentMethods(methods);
        }
      } else {
        setPaymentMethods(methods);
      }
    }).catch(() => {});
  }, [event]);

  useEffect(() => {
    if (defaultData) {
      setFormData(defaultData);
    }
  }, [defaultData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (event) {
      try {
        let paymentData = null;
        if (event.is_paid) {
          if (!paymentMethod) {
            toast({ title: 'Error', description: 'Please select a payment method', variant: 'destructive' });
            return;
          }
          
          let proofUrl = null;
          if (paymentProof && paymentMethod === 'bank_transfer') {
            const uploadResponse = await apiService.payment.uploadProof(0, paymentProof);
            proofUrl = uploadResponse.file_url;
          }
          
          paymentData = {
            payment_method: paymentMethod,
            currency,
            payment_proof: proofUrl
          };
        }
        
        const response = await onSubmit(event.id, paymentData);
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
            {event?.is_paid && (
              <Alert>
                <AlertDescription>
                  <div className="font-semibold mb-1">Event Fee</div>
                  <div>₦{event.price_ngn?.toLocaleString()} {event.price_usdt && `or $${event.price_usdt}`}</div>
                </AlertDescription>
              </Alert>
            )}
            
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
            
            {event?.is_paid && (
              <>
                <div>
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {event.price_ngn && <SelectItem value="NGN">NGN (₦{event.price_ngn.toLocaleString()})</SelectItem>}
                      {event.price_usdt && <SelectItem value="USDT">USDT (${event.price_usdt})</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.length === 0 ? (
                        <SelectItem value="none" disabled>No payment methods available</SelectItem>
                      ) : (
                        paymentMethods.map(method => (
                          <SelectItem key={method.id} value={method.method_type}>
                            {method.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {paymentMethod === 'bank_transfer' && (
                  <div>
                    <Label htmlFor="payment_proof">Payment Proof</Label>
                    <Input
                      id="payment_proof"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    />
                  </div>
                )}
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Processing...' : event?.is_paid ? 'Pay & Register' : 'Confirm Registration'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
