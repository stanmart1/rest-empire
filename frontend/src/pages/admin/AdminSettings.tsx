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
import api from '@/lib/api';

const AdminSettings = () => {
  const [minPayoutNGN, setMinPayoutNGN] = useState('5000');
  const [minPayoutUSDT, setMinPayoutUSDT] = useState('10');
  const [payoutFeeNGN, setPayoutFeeNGN] = useState('1.5');
  const [payoutFeeUSDT, setPayoutFeeUSDT] = useState('2.0');
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
  const [maxReferralDepth, setMaxReferralDepth] = useState('15');
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['platformSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/config/settings/platform');
      return response.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setMinPayoutNGN(settings.min_payout_ngn?.toString() || '5000');
      setMinPayoutUSDT(settings.min_payout_usdt?.toString() || '10');
      setPayoutFeeNGN(settings.payout_fee_ngn?.toString() || '1.5');
      setPayoutFeeUSDT(settings.payout_fee_usdt?.toString() || '2.0');
      setRegistrationEnabled(settings.registration_enabled !== false);
      setEmailVerificationRequired(settings.email_verification_required !== false);
      setMaxReferralDepth(settings.max_referral_depth?.toString() || '15');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      await api.put('/admin/config/settings/platform', data);
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

  const handleSaveSystemSettings = () => {
    updateMutation.mutate({
      registration_enabled: registrationEnabled.toString(),
      email_verification_required: emailVerificationRequired.toString(),
      max_referral_depth: maxReferralDepth,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <p className="text-muted-foreground">Manage application configuration and settings</p>
      </div>

      <Tabs defaultValue="payout">
        <TabsList>
          <TabsTrigger value="payout">Payout Settings</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="referral">Referral Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="payout" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Control platform features and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Registration Enabled</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new user registrations
                  </p>
                </div>
                <Switch
                  checked={registrationEnabled}
                  onCheckedChange={setRegistrationEnabled}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification Required</Label>
                  <p className="text-sm text-muted-foreground">
                    Require email verification for new accounts
                  </p>
                </div>
                <Switch
                  checked={emailVerificationRequired}
                  onCheckedChange={setEmailVerificationRequired}
                />
              </div>

              <Button onClick={handleSaveSystemSettings} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save System Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral" className="space-y-4">
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

              <Button onClick={handleSaveSystemSettings} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Referral Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
