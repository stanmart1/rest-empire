import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
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
import { formatCurrency } from '@/utils/formatters';

const Activation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { data: settings } = useQuery({
    queryKey: ['systemSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/config/config/public/system-settings');
      return response.data;
    },
  });
  
  useEffect(() => {
    if (settings && settings.activation_packages_enabled === false) {
      toast({
        title: "Notice",
        description: "Activation packages are not required. Your account is already active.",
      });
      navigate('/dashboard');
    }
  }, [settings, navigate, toast]);
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
        window.open(data.payment_data.payment_url, '_blank');
        toast({
          title: "Redirecting to Providus",
          description: "Complete payment to activate your account.",
        });
      } else if (method === 'crypto') {
        toast({
          title: "Crypto Payment",
          description: `Send ${formatCurrency(selectedPackage?.price, 'NGN')} equivalent in USDT to ${data.payment_data.wallet_address}. Your account will be activated after blockchain confirmation.`,
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
      case 'expired':
        return 'Subscription Expired';
      default:
        return 'Account Inactive';
    }
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-700';
      case 'suspended':
      case 'expired':
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
          <div className="space-y-3">
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
                {status?.expires_at && status?.status === 'active' && (
                  <p className="text-sm text-muted-foreground">
                    Expires: {new Date(status.expires_at).toLocaleDateString()}
                    {getDaysRemaining(status.expires_at) !== null && (
                      <span className="ml-1">({getDaysRemaining(status.expires_at)} days remaining)</span>
                    )}
                  </p>
                )}
              </div>
              {status?.status === 'pending_payment' && status?.package && (
                <div className="text-right">
                  <p className="text-xl font-bold">
                    {formatCurrency(status.activation_fee, 'NGN')}
                  </p>
                </div>
              )}
            </div>
            {status?.status === 'pending_payment' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-700 font-medium">Payment Successful</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting verification from admins</p>
              </div>
            )}
            {status?.status === 'expired' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-700 font-medium">Subscription Expired</p>
                <p className="text-xs text-red-600 mt-1">Renew your subscription to continue accessing premium features</p>
              </div>
            )}
            {status?.package?.allowed_features && status?.status === 'active' && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-2">Included Features:</p>
                <div className="flex flex-wrap gap-1">
                  {status.package.allowed_features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
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
                      {formatCurrency(pkg.price, 'NGN')}
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
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <p>Duration: {pkg.duration_days} days</p>
                      <p className="mt-1">Includes: {pkg.allowed_features?.map(f => f.replace('_', ' ')).join(', ')}</p>
                    </div>
                    <Button 
                      className="w-full"
                      variant={pkg.slug === 'professional' ? 'default' : 'outline'}
                      onClick={() => handlePackageSelect(pkg)}
                      disabled={status?.status === 'pending_payment'}
                    >
                      {status?.status === 'pending_payment' ? 'Payment Pending' : 'Select Package'}
                    </Button>
                  </div>
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



      {/* Active Account Benefits */}
      {status?.status === 'active' && status?.package?.allowed_features && (
        <Card className="border-2 border-blue-200 bg-blue-50 shadow-lg">
          <CardHeader className="border-b border-blue-200 bg-blue-100/50">
            <CardTitle className="flex items-center gap-3 text-blue-700">
              <div className="p-2 bg-blue-200 rounded-full">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-xl">Account Active</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-blue-700 mb-4 font-medium">
              Congratulations! Your account is now active. You can:
            </p>
            <ul className="space-y-2 text-sm text-blue-700">
              {status.package.allowed_features.map((feature) => {
                const benefits: Record<string, string> = {
                  crypto_signals: 'Access crypto trading signals and market analysis',
                  events: 'Participate in company events and webinars',
                  promo_materials: 'Download promotional materials and resources',
                  book_review: 'Leave reviews and ratings for books',
                  payouts: 'Request payouts of your earnings'
                };
                return benefits[feature] ? (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold mt-0.5">✓</span>
                    <span>{benefits[feature]}</span>
                  </li>
                ) : null;
              })}
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
