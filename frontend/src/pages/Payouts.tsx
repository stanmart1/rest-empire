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
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.enum(['EUR', 'USDT', 'DBSP']),
  method: z.enum(['bank', 'crypto']),
  account_details: z.string().min(5, 'Account details are required'),
});

type PayoutFormData = z.infer<typeof payoutSchema>;

const Payouts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: payouts, isLoading } = usePayouts();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      currency: 'EUR',
      method: 'bank',
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
  const fee = watchAmount ? watchAmount * 0.05 : 0;
  const netAmount = watchAmount ? watchAmount - fee : 0;

  const onSubmit = (data: PayoutFormData) => {
    payoutMutation.mutate(data);
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
                  placeholder="Enter amount"
                  {...register('amount', { valueAsNumber: true })}
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
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                    <SelectItem value="DBSP">DBSP</SelectItem>
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
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  </SelectContent>
                </Select>
                {errors.method && (
                  <p className="text-sm text-destructive">{errors.method.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_details">Account Details</Label>
                <Textarea
                  id="account_details"
                  placeholder="Enter account details (IBAN, wallet address, etc.)"
                  {...register('account_details')}
                />
                {errors.account_details && (
                  <p className="text-sm text-destructive">{errors.account_details.message}</p>
                )}
              </div>
            </div>

            {watchAmount && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Requested Amount:</span>
                  <span>{formatCurrency(watchAmount, watchCurrency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee (5%):</span>
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
          <CardTitle>Payout History</CardTitle>
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
                      <p className="text-sm">{formatDateTime(payout.created_at)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{formatCurrency(payout.amount, payout.currency)}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{payout.method}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm">{formatCurrency(payout.fee, payout.currency)}</p>
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
