import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { usePayouts } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Payout } from '@/lib/types';

const payoutSchema = z.object({
  amount: z.coerce.number(),
  currency: z.enum(['NGN', 'USDT']),
  method: z.enum(['bank_transfer', 'crypto']),
  // Bank fields
  account_number: z.string().optional(),
  account_name: z.string().optional(),
  bank_name: z.string().optional(),
  // Crypto fields
  wallet_address: z.string().optional(),
  network: z.string().optional(),
});

type PayoutFormData = z.infer<typeof payoutSchema>;

const Payouts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { data: payouts, isLoading } = usePayouts(statusFilter === 'all' ? {} : { status: statusFilter });

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      currency: 'NGN',
      method: 'bank_transfer',
    },
  });

  const payoutMutation = useMutation({
    mutationFn: (data: PayoutFormData) => apiService.payouts.requestPayout(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payout request submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to submit payout request",
        variant: "destructive",
      });
    },
  });

  const watchAmount = watch('amount');
  const watchCurrency = watch('currency');
  
  const MINIMUM_PAYOUT = { NGN: 5000, USDT: 10 };
  const FEE_PERCENTAGE = { NGN: 1.5, USDT: 2.0 };
  
  const fee = watchAmount ? watchAmount * (FEE_PERCENTAGE[watchCurrency] / 100) : 0;
  const netAmount = watchAmount ? watchAmount - fee : 0;

  const onSubmit = (data: PayoutFormData) => {
    const minAmount = MINIMUM_PAYOUT[data.currency];
    if (data.amount < minAmount) {
      toast({
        title: "Error",
        description: `Minimum payout is ₦${minAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }
    const account_details = data.method === 'bank_transfer'
      ? {
          account_number: data.account_number,
          account_name: data.account_name,
          bank_name: data.bank_name,
        }
      : {
          wallet_address: data.wallet_address,
          network: data.network || 'TRC20',
        };

    const payoutData = {
      amount: data.amount,
      currency: data.currency,
      payout_method: data.method,
      account_details
    };
    payoutMutation.mutate(payoutData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
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
                  placeholder="Min: ₦5,000"
                  {...register('amount')}
                />
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select onValueChange={(value) => setValue('currency', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN (Naira)</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-destructive">{errors.currency.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select onValueChange={(value) => setValue('method', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
                {errors.method && (
                  <p className="text-sm text-destructive">{errors.method.message}</p>
                )}
              </div>

              {watch('method') === 'bank_transfer' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      placeholder="1234567890"
                      {...register('account_number')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_name">Account Name</Label>
                    <Input
                      id="account_name"
                      placeholder="John Doe"
                      {...register('account_name')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      placeholder="GTBank"
                      {...register('bank_name')}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="wallet_address">Wallet Address</Label>
                    <Input
                      id="wallet_address"
                      placeholder="TXxx..."
                      {...register('wallet_address')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="network">Network</Label>
                    <Input
                      id="network"
                      placeholder="TRC20"
                      defaultValue="TRC20"
                      {...register('network')}
                    />
                  </div>
                </>
              )}
            </div>

            {watchAmount && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Requested Amount:</span>
                  <span>{formatCurrency(watchAmount, watchCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee ({FEE_PERCENTAGE[watchCurrency]}%):</span>
                  <span>{formatCurrency(fee, watchCurrency)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Net Amount:</span>
                  <span>{formatCurrency(netAmount, watchCurrency)}</span>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={payoutMutation.isPending}
            >
              {payoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Submit Payout Request
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payout History</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Method</th>
                  <th className="text-left p-4 font-medium">Fee</th>
                  <th className="text-left p-4 font-medium">Net Amount</th>
                  <th className="text-center p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts?.map((payout: Payout) => (
                  <tr key={payout.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <p className="text-sm">{formatDateTime(payout.requested_at)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{formatCurrency(payout.amount, payout.currency)}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{payout.payout_method.replace('_', ' ')}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{formatCurrency(payout.processing_fee, payout.currency)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold">{formatCurrency(payout.net_amount, payout.currency)}</p>
                    </td>
                    <td className="p-4 text-center">
                      <StatusBadge status={payout.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!payouts?.length && (
              <p className="text-center text-muted-foreground py-8">No payout requests found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Payouts;
