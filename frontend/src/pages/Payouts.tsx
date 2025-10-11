import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import api from '@/lib/api';
import { Payout } from '@/lib/types';
import { toast } from 'sonner';

const payoutSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.enum(['EUR', 'USDT', 'DBSP']),
  method: z.enum(['bank', 'crypto']),
  accountDetails: z.string().min(5, 'Account details are required'),
});

type PayoutFormData = z.infer<typeof payoutSchema>;

const Payouts = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      currency: 'EUR',
      method: 'bank',
    },
  });

  const watchAmount = watch('amount');
  const watchCurrency = watch('currency');
  const fee = watchAmount ? watchAmount * 0.05 : 0;
  const netAmount = watchAmount ? watchAmount - fee : 0;

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const response = await api.get('/payouts');
        setPayouts(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch payouts:', error);
        setPayouts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayouts();
  }, []);

  const onSubmit = async (data: PayoutFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/payouts', data);
      toast.success('Payout request submitted successfully');
      const response = await api.get('/payouts');
      setPayouts(response.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit payout request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payouts</h1>
        <p className="text-muted-foreground">Request withdrawals and track payout history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  onValueChange={(value) => setValue('currency', value as any)}
                  defaultValue="EUR"
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="DBSP">DBSP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  onValueChange={(value) => setValue('method', value as any)}
                  defaultValue="bank"
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountDetails">Account Details</Label>
                <Textarea
                  id="accountDetails"
                  placeholder="IBAN or wallet address"
                  {...register('accountDetails')}
                  disabled={isSubmitting}
                />
                {errors.accountDetails && (
                  <p className="text-sm text-destructive">{errors.accountDetails.message}</p>
                )}
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-white">Requested Amount:</span>
                <span className="font-semibold text-white">{formatCurrency(watchAmount || 0, watchCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Processing Fee (5%):</span>
                <span className="text-white">-{formatCurrency(fee, watchCurrency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span className="text-white">Net Amount:</span>
                <span className="text-white">{formatCurrency(netAmount, watchCurrency)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Request Payout'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Method</th>
                  <th className="text-right p-4 font-medium">Amount</th>
                  <th className="text-right p-4 font-medium">Fee</th>
                  <th className="text-right p-4 font-medium">Net Amount</th>
                  <th className="text-center p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <p className="text-sm">{formatDateTime(payout.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{payout.method}</span>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-medium">{formatCurrency(payout.amount, payout.currency)}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-destructive">-{formatCurrency(payout.fee, payout.currency)}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-semibold text-success">
                        {formatCurrency(payout.netAmount, payout.currency)}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={payout.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payouts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No payout requests yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payouts;
