import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUpdateSystemSettings } from '@/hooks/useSystemSettings';
import { SystemSettings } from '@/types/system';

interface SystemConfigurationProps {
  settings: SystemSettings;
}

const SystemConfiguration = ({ settings }: SystemConfigurationProps) => {
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [activationPackagesEnabled, setActivationPackagesEnabled] = useState(true);
  const [kycRequired, setKycRequired] = useState(false);
  const [dailyWithdrawalLimit, setDailyWithdrawalLimit] = useState('0');
  const [weeklyWithdrawalLimit, setWeeklyWithdrawalLimit] = useState('0');
  const [monthlyWithdrawalLimit, setMonthlyWithdrawalLimit] = useState('0');
  
  const updateMutation = useUpdateSystemSettings();

  useEffect(() => {
    if (settings) {
      setRegistrationEnabled(settings.registration_enabled !== false);
      setActivationPackagesEnabled(settings.activation_packages_enabled !== false);
      setKycRequired(settings.kyc_required === true);
      setDailyWithdrawalLimit(settings.daily_withdrawal_limit?.toString() || '0');
      setWeeklyWithdrawalLimit(settings.weekly_withdrawal_limit?.toString() || '0');
      setMonthlyWithdrawalLimit(settings.monthly_withdrawal_limit?.toString() || '0');
    }
  }, [settings]);

  const handleSave = () => {
    updateMutation.mutate({
      registration_enabled: registrationEnabled.toString(),
      activation_packages_enabled: activationPackagesEnabled.toString(),
      kyc_required: kycRequired.toString(),
      daily_withdrawal_limit: dailyWithdrawalLimit,
      weekly_withdrawal_limit: weeklyWithdrawalLimit,
      monthly_withdrawal_limit: monthlyWithdrawalLimit,
    });
  };

  return (
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
            <Label>Activation Packages Enabled</Label>
            <p className="text-sm text-muted-foreground">
              Allow users to purchase activation packages
            </p>
          </div>
          <Switch
            checked={activationPackagesEnabled}
            onCheckedChange={setActivationPackagesEnabled}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>KYC Verification Required</Label>
            <p className="text-sm text-muted-foreground">
              Require identity verification before payouts
            </p>
          </div>
          <Switch
            checked={kycRequired}
            onCheckedChange={setKycRequired}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold">Withdrawal Limits (₦)</h3>
          <p className="text-sm text-muted-foreground">Set to 0 for unlimited withdrawals</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Daily Limit</Label>
              <Input
                type="text"
                value={dailyWithdrawalLimit ? `₦${parseFloat(dailyWithdrawalLimit).toLocaleString()}` : '₦0'}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setDailyWithdrawalLimit(value || '0');
                }}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Weekly Limit</Label>
              <Input
                type="text"
                value={weeklyWithdrawalLimit ? `₦${parseFloat(weeklyWithdrawalLimit).toLocaleString()}` : '₦0'}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setWeeklyWithdrawalLimit(value || '0');
                }}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Monthly Limit</Label>
              <Input
                type="text"
                value={monthlyWithdrawalLimit ? `₦${parseFloat(monthlyWithdrawalLimit).toLocaleString()}` : '₦0'}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setMonthlyWithdrawalLimit(value || '0');
                }}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save System Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SystemConfiguration;
