import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { CryptoSignal } from '@/types/crypto-signals';
import { useCryptoSignals, useCreateSignal, useUpdateSignal, useDeleteSignal } from '@/hooks/useCryptoSignals';
import RichTextEditor from '@/components/ui/rich-text-editor';

const AdminCryptoSignals = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<CryptoSignal | null>(null);

  const { data: signals = [], isLoading } = useCryptoSignals();
  const createMutation = useCreateSignal();
  const updateMutation = useUpdateSignal();
  const deleteMutation = useDeleteSignal();

  const formatPrice = (price: string | undefined) => {
    if (!price) return '-';
    const num = parseFloat(price);
    return num >= 1 ? `$${num.toFixed(2)}` : `$${num.toFixed(8)}`;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      coin: formData.get('coin') as string,
      signal_type: formData.get('signal_type') as string,
      entry_price: formData.get('entry_price') as string,
      target_price: (formData.get('target_price') as string) || undefined,
      stop_loss: (formData.get('stop_loss') as string) || undefined,
      description: (formData.get('description') as string) || undefined,
      is_published: formData.get('is_published') === 'true'
    };

    if (editingSignal) {
      updateMutation.mutate({ id: editingSignal.id, data });
      setEditingSignal(null);
    } else {
      createMutation.mutate(data);
      setIsCreateOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trading Signals</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Create Signal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Trading Signal</DialogTitle>
            </DialogHeader>
            <SignalForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Signals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading signals...</p>
            </div>
          ) : signals.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">No Signals Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first trading signal to get started.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coin</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Stop Loss</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell className="font-medium">{signal.coin}</TableCell>
                    <TableCell>
                      <Badge variant={signal.signal_type === 'buy' ? 'default' : 'destructive'}>
                        {signal.signal_type === 'buy' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {signal.signal_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(signal.entry_price)}</TableCell>
                    <TableCell>{formatPrice(signal.target_price)}</TableCell>
                    <TableCell>{formatPrice(signal.stop_loss)}</TableCell>
                    <TableCell><Badge variant="outline">{signal.status}</Badge></TableCell>
                    <TableCell>{signal.is_published ? '✓' : '✗'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingSignal(signal)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(signal.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editingSignal && (
        <Dialog open={!!editingSignal} onOpenChange={() => setEditingSignal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Signal</DialogTitle>
            </DialogHeader>
            <SignalForm onSubmit={handleSubmit} signal={editingSignal} isLoading={updateMutation.isPending} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const SignalForm = ({ 
  onSubmit, 
  signal, 
  isLoading 
}: { 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; 
  signal?: CryptoSignal | null;
  isLoading: boolean;
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Coin</Label>
        <Input name="coin" defaultValue={signal?.coin} placeholder="BTC/USDT" required disabled={isLoading} />
      </div>
      <div>
        <Label>Signal Type</Label>
        <Select name="signal_type" defaultValue={signal?.signal_type || 'buy'} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Buy</SelectItem>
            <SelectItem value="sell">Sell</SelectItem>
            <SelectItem value="hold">Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Entry Price</Label>
        <Input name="entry_price" type="number" step="0.00000001" defaultValue={signal?.entry_price} required disabled={isLoading} />
      </div>
      <div>
        <Label>Target Price</Label>
        <Input name="target_price" type="number" step="0.00000001" defaultValue={signal?.target_price} disabled={isLoading} />
      </div>
      <div>
        <Label>Stop Loss</Label>
        <Input name="stop_loss" type="number" step="0.00000001" defaultValue={signal?.stop_loss} disabled={isLoading} />
      </div>
      <div>
        <Label>Description</Label>
        <RichTextEditor
          value={signal?.description || ''}
          onChange={() => {}}
          disabled={isLoading}
          minHeight="100px"
        />
      </div>
      <div>
        <Label>Publish</Label>
        <Select name="is_published" defaultValue={signal?.is_published ? 'true' : 'false'} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isLoading ? 'Saving...' : 'Save Signal'}
      </Button>
    </form>
  );
};

export default AdminCryptoSignals;
