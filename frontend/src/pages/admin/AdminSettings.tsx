import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Settings } from 'lucide-react';
import api from '@/lib/api';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/contexts/AuthContext';
import PaymentGatewayModal from '@/components/admin/PaymentGatewayModal';
import BonusConfiguration from '@/components/admin/BonusConfiguration';
import EmailConfiguration from '@/components/admin/EmailConfiguration';
import SystemConfiguration from '@/components/admin/SystemConfiguration';

const AdminSettings = () => {
  const { hasPermission } = usePermission();
  const { refreshUser } = useAuth();
  const [minPayoutNGN, setMinPayoutNGN] = useState('5000');
  const [minPayoutUSDT, setMinPayoutUSDT] = useState('10');
  const [payoutFeeNGN, setPayoutFeeNGN] = useState('1.5');
  const [payoutFeeUSDT, setPayoutFeeUSDT] = useState('2.0');
  const [maxReferralDepth, setMaxReferralDepth] = useState('15');
  
  // Payment Gateway States
  const [gtpayEnabled, setGtpayEnabled] = useState(false);
  const [gtpayMerchantId, setGtpayMerchantId] = useState('');
  const [gtpayApiKey, setGtpayApiKey] = useState('');
  const [gtpayCallbackUrl, setGtpayCallbackUrl] = useState('');
  
  const [providusEnabled, setProvidusEnabled] = useState(false);
  const [providusAccountNumber, setProvidusAccountNumber] = useState('');
  const [providusBankCode, setProvidusBankCode] = useState('');
  const [providusApiKey, setProvidusApiKey] = useState('');
  
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');
  const [paystackCallbackUrl, setPaystackCallbackUrl] = useState('');
  
  const [cryptoEnabled, setCryptoEnabled] = useState(false);
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState('');
  
  const [bankTransferEnabled, setBankTransferEnabled] = useState(false);
  const [bankTransferBankName, setBankTransferBankName] = useState('');
  const [bankTransferAccountNumber, setBankTransferAccountNumber] = useState('');
  const [bankTransferAccountName, setBankTransferAccountName] = useState('');
  
  const [editingGateway, setEditingGateway] = useState<any>(null);
  const [gatewaySettings, setGatewaySettings] = useState<Record<string, any>>({});
  const [togglingGatewayId, setTogglingGatewayId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/config/config/settings/platform');
      return response.data;
    },
  });

  const { data: availableGateways, isLoading: isLoadingGateways } = useQuery({
    queryKey: ['paymentGateways'],
    queryFn: async () => {
      const response = await api.get('/admin/config/payment-gateways');
      return response.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setMinPayoutNGN(settings.min_payout_ngn?.toString() || '5000');
      setMinPayoutUSDT(settings.min_payout_usdt?.toString() || '10');
      setPayoutFeeNGN(settings.payout_fee_ngn?.toString() || '1.5');
      setPayoutFeeUSDT(settings.payout_fee_usdt?.toString() || '2.0');
      setMaxReferralDepth(settings.max_referral_depth?.toString() || '15');
    }
  }, [settings]);
  


  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      await api.put('/admin/config/config/settings/platform', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platformSettings'] });
      toast.success('Settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });

  const handleSavePayoutSettings = () => {
    updateMutation.mutate({
      min_payout_ngn: minPayoutNGN,
      min_payout_usdt: minPayoutUSDT,
      payout_fee_ngn: payoutFeeNGN,
      payout_fee_usdt: payoutFeeUSDT,
    });
  };

  const handleSaveReferralSettings = () => {
    updateMutation.mutate({
      max_referral_depth: maxReferralDepth,
    });
  };
  
  const paymentGatewayMutation = useMutation({
    mutationFn: async ({ gateway_id, data }: { gateway_id: string; data: any }) => {
      await api.put(`/admin/config/payment-gateways/${gateway_id}`, data);
    },
    onMutate: async ({ gateway_id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['paymentGateways'] });
      const previousGateways = queryClient.getQueryData(['paymentGateways']);
      
      queryClient.setQueryData(['paymentGateways'], (old: any) => {
        if (!old) return old;
        return old.map((g: any) => 
          g.gateway_id === gateway_id ? { ...g, ...data } : g
        );
      });
      
      return { previousGateways };
    },
    onSuccess: () => {
      toast.success('Payment gateway updated successfully');
      setTogglingGatewayId(null);
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['paymentGateways'], context?.previousGateways);
      toast.error('Failed to update payment gateway');
      setTogglingGatewayId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentGateways'] });
    },
  });
  
  const handleSavePaymentGateways = () => {
    if (!editingGateway) return;
    paymentGatewayMutation.mutate(
      {
        gateway_id: editingGateway.gateway_id,
        data: { config_values: gatewaySettings }
      },
      {
        onSuccess: () => {
          setEditingGateway(null);
        }
      }
    );
  };
  
  const handleFieldChange = (key: string, value: string) => {
    setGatewaySettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleToggleGateway = (gateway: any) => {
    setTogglingGatewayId(gateway.gateway_id);
    paymentGatewayMutation.mutate({
      gateway_id: gateway.gateway_id,
      data: { is_enabled: !gateway.is_enabled }
    });
  };
  
  const handleEditGateway = (gateway: any) => {
    setGatewaySettings(gateway.config_values || {});
    setEditingGateway(gateway);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <p className="text-muted-foreground">Manage application configuration and settings</p>
      </div>

      <Tabs defaultValue="payout">
        <TabsList>
          {hasPermission('config:view') && <TabsTrigger value="payout">Payout Settings</TabsTrigger>}
          {hasPermission('config:payment_gateways') && <TabsTrigger value="payment">Payment Gateways</TabsTrigger>}
          {hasPermission('config:bonus_settings') && <TabsTrigger value="bonus">Bonus Settings</TabsTrigger>}
          {hasPermission('config:email_settings') && <TabsTrigger value="email">Email Settings</TabsTrigger>}
          {hasPermission('config:view') && <TabsTrigger value="system">System Settings</TabsTrigger>}
          {hasPermission('config:view') && <TabsTrigger value="referral">Referral Settings</TabsTrigger>}
        </TabsList>

        {hasPermission('config:view') && <TabsContent value="payout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Configuration</CardTitle>
              <CardDescription>Configure minimum payout amounts and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">NGN Payouts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPayoutNGN">Minimum Payout Amount (₦)</Label>
                    <Input
                      id="minPayoutNGN"
                      type="number"
                      value={minPayoutNGN}
                      onChange={(e) => setMinPayoutNGN(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payoutFeeNGN">Payout Fee (%)</Label>
                    <Input
                      id="payoutFeeNGN"
                      type="number"
                      step="0.1"
                      value={payoutFeeNGN}
                      onChange={(e) => setPayoutFeeNGN(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold">USDT Payouts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPayoutUSDT">Minimum Payout Amount ($)</Label>
                    <Input
                      id="minPayoutUSDT"
                      type="number"
                      value={minPayoutUSDT}
                      onChange={(e) => setMinPayoutUSDT(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payoutFeeUSDT">Payout Fee (%)</Label>
                    <Input
                      id="payoutFeeUSDT"
                      type="number"
                      step="0.1"
                      value={payoutFeeUSDT}
                      onChange={(e) => setPayoutFeeUSDT(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePayoutSettings} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Payout Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>}

        {hasPermission('config:payment_gateways') && <TabsContent value="payment" className="space-y-4">
          {isLoadingGateways ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading payment gateways...</p>
            </div>
          ) : !availableGateways || availableGateways.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <p className="text-muted-foreground">No payment gateways configured</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {availableGateways.map((gateway: any) => {
                const descriptions: Record<string, string> = {
                  gtpay: 'Online payment gateway',
                  providus: 'Dynamic account generation',
                  paystack: 'Card & bank payments',
                  crypto: 'USDT cryptocurrency payments',
                  bank_transfer: 'Manual bank transfer'
                };
                const isToggling = togglingGatewayId === gateway.gateway_id;
                return (
                  <Card key={gateway.id} className="flex flex-col p-4 h-40">
                    <div className="flex items-center justify-between w-full mb-2">
                      <h3 className="font-semibold text-sm">{gateway.name}</h3>
                      <Switch 
                        checked={gateway.is_enabled} 
                        onCheckedChange={() => handleToggleGateway(gateway)}
                        disabled={isToggling}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground flex-1">
                      {isToggling ? 'Updating...' : descriptions[gateway.gateway_id] || 'Payment gateway'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditGateway(gateway)}
                      className="mt-auto bg-green-50 hover:bg-green-600 text-green-700 hover:text-white border-green-200"
                      disabled={isToggling}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}

          <PaymentGatewayModal
            open={!!editingGateway}
            onClose={() => setEditingGateway(null)}
            gateway={editingGateway}
            values={gatewaySettings}
            onChange={handleFieldChange}
            onSave={handleSavePaymentGateways}
            isSaving={paymentGatewayMutation.isPending}
          />
        </TabsContent>}

        {hasPermission('config:bonus_settings') && <TabsContent value="bonus">
          <BonusConfiguration />
        </TabsContent>}

        {hasPermission('config:email_settings') && <TabsContent value="email">
          <EmailConfiguration />
        </TabsContent>}

        {hasPermission('config:view') && <TabsContent value="system" className="space-y-4">
          <SystemConfiguration settings={settings} />
        </TabsContent>}

        {hasPermission('config:view') && <TabsContent value="referral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Referral Configuration</CardTitle>
              <CardDescription>Configure referral and MLM settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxReferralDepth">Maximum Referral Depth</Label>
                <Input
                  id="maxReferralDepth"
                  type="number"
                  value={maxReferralDepth}
                  onChange={(e) => setMaxReferralDepth(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum levels for unilevel bonus calculations
                </p>
              </div>

              <Button onClick={handleSaveReferralSettings} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Referral Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>}
      </Tabs>
    </div>
  );
};

export default AdminSettings;
