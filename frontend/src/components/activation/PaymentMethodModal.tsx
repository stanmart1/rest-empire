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
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (open) {
      fetchMethods();
    }
  }, [open]);

  const fetchMethods = async () => {
    setLoadingMethods(true);
    try {
      const data = await apiService.payment.getMethods();
      const filtered = data.methods.filter((m: PaymentMethod) => m.currency === currency);
      setMethods(filtered);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleMethodClick = async (methodId: string) => {
    setSelectedMethod(methodId);
    setInitiatingPayment(true);
    
    try {
      const response = await apiService.payment.initiatePayment({
        amount,
        currency,
        payment_method: methodId
      });
      setPaymentData(response);
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      alert(error.response?.data?.detail || 'Failed to initiate payment');
      setSelectedMethod(null);
    } finally {
      setInitiatingPayment(false);
    }
  };

  const handleProceed = () => {
    if (selectedMethod && paymentData) {
      onMethodSelected(selectedMethod, paymentData);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedMethod(null);
    setPaymentData(null);
    onClose();
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
              ₦{amount.toLocaleString()}
            </p>
          </div>

          {loadingMethods ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Loading payment methods...</span>
            </div>
          ) : methods.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No payment methods available</p>
            </div>
          ) : !selectedMethod ? (
            methods.map((method) => (
              <Card 
                key={method.id}
                className="p-4 hover:border-primary cursor-pointer transition-colors"
                onClick={() => !initiatingPayment && handleMethodClick(method.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {getIcon(method.id)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{method.name}</h4>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : initiatingPayment ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Initiating payment...</span>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">Selected payment method:</p>
              <p className="font-medium">{methods.find(m => m.id === selectedMethod)?.name}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={initiatingPayment}>
            Cancel
          </Button>
          {selectedMethod && paymentData && (
            <Button onClick={handleProceed} className="flex-1" disabled={initiatingPayment}>
              Proceed to Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodModal;
