import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Building2, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import apiService from '@/services/api';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  currency: string;
  instant: boolean;
}

interface PaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  packageId: number;
  amount: number;
  currency: string;
  onMethodSelected: (method: string, paymentData: any) => void;
}

const PaymentMethodModal = ({ 
  open, 
  onClose, 
  packageId, 
  amount, 
  currency,
  onMethodSelected 
}: PaymentMethodModalProps) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchMethods();
    }
  }, [open]);

  const fetchMethods = async () => {
    try {
      const data = await apiService.payment.getMethods();
      const filtered = data.methods.filter((m: PaymentMethod) => m.currency === currency);
      setMethods(filtered);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    }
  };

  const handleMethodSelect = async (methodId: string) => {
    setSelectedMethod(methodId);
    setLoading(true);
    
    try {
      const response = await apiService.payment.initiatePayment({
        amount,
        currency,
        payment_method: methodId
      });
      
      onMethodSelected(methodId, response);
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      alert(error.response?.data?.detail || 'Failed to initiate payment');
    } finally {
      setLoading(false);
      setSelectedMethod(null);
    }
  };

  const getIcon = (methodId: string) => {
    switch (methodId) {
      case 'bank_transfer':
        return <Building2 className="w-6 h-6" />;
      case 'gtpay':
      case 'providus':
      case 'paystack':
        return <CreditCard className="w-6 h-6" />;
      case 'crypto':
        return <Wallet className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="text-2xl font-bold">
              {currency === 'NGN' ? '₦' : currency === 'USDT' ? '$' : '€'}
              {amount.toLocaleString()}
            </p>
          </div>

          {methods.map((method) => (
            <Card 
              key={method.id}
              className="p-4 hover:border-primary cursor-pointer transition-colors"
              onClick={() => !loading && handleMethodSelect(method.id)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getIcon(method.id)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{method.name}</h4>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                {loading && selectedMethod === method.id && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </div>
            </Card>
          ))}
        </div>

        <Button variant="outline" onClick={onClose} className="mt-4">
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;
