import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Check, Loader2 } from 'lucide-react';
import { useActivationPackages, useActivationStatus } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ActivationPackage, UserActivation } from '@/types/activation';
import PaymentMethodModal from '@/components/activation/PaymentMethodModal';
import BankTransferModal from '@/components/activation/BankTransferModal';

const Activation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPackage, setSelectedPackage] = useState<ActivationPackage | null>(null);
  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [bankTransferModalOpen, setBankTransferModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const { data: packages, isLoading: packagesLoading } = useActivationPackages();
  const { data: status, isLoading: statusLoading } = useActivationStatus();

  const handlePackageSelect = (pkg: ActivationPackage) => {
    setSelectedPackage(pkg);
    setPaymentMethodModalOpen(true);
  };

  const handlePaymentMethodSelected = async (method: string, data: any) => {
    setPaymentData(data);
    setPaymentMethodModalOpen(false);

    try {
      // Create activation request
      await apiService.activation.requestActivation({
        package_id: selectedPackage!.id,
        payment_method: method
      });
      
      // Link transaction to activation for all methods
      if (data.transaction_id) {
        await apiService.activation.linkTransaction(data.transaction_id);
      }

      // Handle different payment methods
      if (method === 'bank_transfer') {
        setBankTransferModalOpen(true);
      } else if (method === 'gtpay') {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payment_data.gateway_url;
        form.target = '_blank';
        
        Object.keys(data.payment_data).forEach(key => {
          if (key !== 'gateway_url') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.payment_data[key];
            form.appendChild(input);
          }
        });
        
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        toast({
          title: "Redirecting",
          description: "Opening payment gateway. Complete payment to activate your account.",
        });
      } else if (method === 'paystack') {
        window.open(data.payment_data.authorization_url, '_blank');
        toast({
          title: "Redirecting to Paystack",
          description: "Complete payment to activate your account.",
        });
      } else if (method === 'providus') {
        toast({
          title: "Account Generated",
          description: `Transfer ₦${selectedPackage?.price.toLocaleString()} to account ${data.payment_data.account_number}. Your account will be activated after payment confirmation.`,
        });
      } else if (method === 'crypto') {
        toast({
          title: "Crypto Payment",
          description: `Send ₦${selectedPackage?.price.toLocaleString()} equivalent in USDT to ${data.payment_data.wallet_address}. Your account will be activated after blockchain confirmation.`,
        });
      }

      // Refresh activation status
      await queryClient.invalidateQueries({ queryKey: ['activation-status'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['activation-status'] });
    toast({
      title: "Success",
      description: "Payment proof submitted. Awaiting admin confirmation.",
    });
    setSelectedPackage(null);
    setPaymentData(null);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'pending_payment':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Account Active';
      case 'pending_payment':
        return 'Payment Pending';
      case 'suspended':
        return 'Account Suspended';
      default:
        return 'Account Inactive';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (packagesLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Activation</h1>
        <p className="text-muted-foreground">
          Activate your account to start earning bonuses and building your team
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getStatusIcon(status?.status)}
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Badge className={getStatusColor(status?.status)}>
                {getStatusText(status?.status)}
              </Badge>
              {status?.package && (
                <p className="text-sm text-muted-foreground mt-2">
                  Package: {status.package.name}
                </p>
              )}
              {status?.activated_at && (
                <p className="text-sm text-muted-foreground">
                  Activated: {new Date(status.activated_at).toLocaleDateString()}
                </p>
              )}
            </div>
            {status?.status === 'pending_payment' && status?.package && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Amount Due</p>
                <p className="text-xl font-bold">
                  ₦{status.activation_fee?.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Contact support to complete payment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activation Packages */}
      {status?.status !== 'active' && packages && packages.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Choose Your Activation Package</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg: ActivationPackage) => (
              <Card 
                key={pkg.id} 
                className={`relative hover:shadow-lg transition-shadow ${
                  pkg.slug === 'professional' ? 'border-primary shadow-md' : ''
                }`}
              >
                {pkg.slug === 'professional' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle className="text-center">
                    {pkg.name}
                  </CardTitle>
                  <div className="text-center">
                    <span className="text-3xl font-bold">
                      ₦{pkg.price.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground"> one-time</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    {pkg.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="w-full"
                    variant={pkg.slug === 'professional' ? 'default' : 'outline'}
                    onClick={() => handlePackageSelect(pkg)}
                    disabled={status?.status === 'pending_payment'}
                  >
                    {status?.status === 'pending_payment' ? 'Payment Pending' : 'Select Package'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* No Packages Available */}
      {status?.status !== 'active' && (!packages || packages.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No activation packages available at the moment. Please contact support.</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Instructions */}
      {status?.status === 'pending_payment' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Clock className="w-5 h-5" />
              Payment Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-yellow-700">
                Your activation request has been submitted. To complete your account activation:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-600">
                <li>Contact our support team</li>
                <li>Complete payment of ₦{status.activation_fee?.toLocaleString()}</li>
                <li>Your account will be activated within 24 hours</li>
              </ol>
              <div className="mt-4 p-3 bg-white rounded border">
                <p className="text-sm font-medium">Support Contact:</p>
                <p className="text-sm">Contact support through the Support page</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Account Benefits */}
      {status?.status === 'active' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              Account Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 mb-3">
              Congratulations! Your account is now active. You can:
            </p>
            <ul className="space-y-1 text-sm text-green-600">
              <li>• Earn bonuses from your team's activities</li>
              <li>• Build and manage your team</li>
              <li>• Access training materials and resources</li>
              <li>• Participate in company events and webinars</li>
              <li>• Request payouts of your earnings</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Modal */}
      {selectedPackage && (
        <PaymentMethodModal
          open={paymentMethodModalOpen}
          onClose={() => {
            setPaymentMethodModalOpen(false);
            setSelectedPackage(null);
          }}
          packageId={selectedPackage.id}
          amount={selectedPackage.price}
          currency={selectedPackage.currency}
          onMethodSelected={handlePaymentMethodSelected}
        />
      )}

      {/* Bank Transfer Modal */}
      {paymentData && (
        <BankTransferModal
          open={bankTransferModalOpen}
          onClose={() => setBankTransferModalOpen(false)}
          paymentData={paymentData}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Activation;
