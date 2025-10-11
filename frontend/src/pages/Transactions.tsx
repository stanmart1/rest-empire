import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { useTransactions } from '@/hooks/useApi';
import { Transaction } from '@/lib/types';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const { data: transactions, isLoading } = useTransactions({
    type: activeTab !== 'all' ? activeTab : undefined
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View your transaction history</p>
        </div>
        <Button 
          variant="outline"
          onClick={() => {
            // TODO: Implement export functionality
            alert('Export functionality coming soon');
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-border px-6 pt-4">
              <TabsList className="h-auto p-0 bg-transparent border-0 gap-6 w-full justify-start">
                <TabsTrigger 
                  value="all"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="purchase"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Purchases
                </TabsTrigger>
                <TabsTrigger 
                  value="bonus"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Bonuses
                </TabsTrigger>
                <TabsTrigger 
                  value="payout"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Payouts
                </TabsTrigger>
                <TabsTrigger 
                  value="refund"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-4 pb-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Refunds
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="space-y-4 p-6 mt-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Description</th>
                      <th className="text-left p-4 font-medium">Payment Method</th>
                      <th className="text-right p-4 font-medium">Amount</th>
                      <th className="text-center p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((transaction: Transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-border hover:bg-muted/50 cursor-pointer"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <td className="p-4">
                          <p className="text-sm">{formatDateTime(transaction.created_at)}</p>
                        </td>
                        <td className="p-4">
                          <span className="capitalize">{transaction.type}</span>
                        </td>
                        <td className="p-4">
                          <p>{transaction.description}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{transaction.paymentMethod || '-'}</p>
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-semibold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={transaction.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!transactions?.length && (
                  <p className="text-center text-muted-foreground py-8">No transactions found</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={selectedTransaction.status} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="capitalize">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p>{selectedTransaction.paymentMethod || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{formatDateTime(selectedTransaction.created_at)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p>{selectedTransaction.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
