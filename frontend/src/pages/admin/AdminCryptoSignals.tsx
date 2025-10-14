import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface CryptoSignal {
  id: number;
  coin: string;
  signal_type: string;
  entry_price: string;
  target_price?: string;
  stop_loss?: string;
  current_price?: string;
  status: string;
  description?: string;
  is_published: boolean;
  created_at: string;
}

const AdminCryptoSignals = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<CryptoSignal | null>(null);
  const queryClient = useQueryClient();

  const formatPrice = (price: string | undefined) => {
    if (!price) return '-';
    const num = parseFloat(price);
    return num >= 1 ? `$${num.toFixed(2)}` : `$${num.toFixed(8)}`;
  };

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['admin-crypto-signals'],
    queryFn: async () => {
      const response = await api.get('/crypto/signals');
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/crypto/signals', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crypto-signals'] });
      setIsCreateOpen(false);
      toast.success('Signal created successfully');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/crypto/signals/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crypto-signals'] });
      setEditingSignal(null);
      toast.success('Signal updated successfully');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/crypto/signals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-crypto-signals'] });
      toast.success('Signal deleted successfully');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      coin: formData.get('coin'),
      signal_type: formData.get('signal_type'),
      entry_price: formData.get('entry_price'),
      target_price: formData.get('target_price') || null,
      stop_loss: formData.get('stop_loss') || null,
      description: formData.get('description') || null,
      is_published: formData.get('is_published') === 'true'
    };

    if (editingSignal) {
      updateMutation.mutate({ id: editingSignal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Crypto Signals</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Create Signal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Crypto Signal</DialogTitle>
            </DialogHeader>
            <SignalForm onSubmit={handleSubmit} />
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
                    Create your first crypto trading signal to get started.
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
                {signals.map((signal: CryptoSignal) => (
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
            <SignalForm onSubmit={handleSubmit} signal={editingSignal} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const SignalForm = ({ onSubmit, signal }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void; signal?: CryptoSignal | null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Coin</Label>
        <Input name="coin" defaultValue={signal?.coin} placeholder="USDT" required disabled={isSubmitting} />
      </div>
      <div>
        <Label>Signal Type</Label>
        <Select name="signal_type" defaultValue={signal?.signal_type || 'buy'} disabled={isSubmitting}>
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
        <Input name="entry_price" type="number" step="0.00000001" defaultValue={signal?.entry_price} required disabled={isSubmitting} />
      </div>
      <div>
        <Label>Target Price</Label>
        <Input name="target_price" type="number" step="0.00000001" defaultValue={signal?.target_price} disabled={isSubmitting} />
      </div>
      <div>
        <Label>Stop Loss</Label>
        <Input name="stop_loss" type="number" step="0.00000001" defaultValue={signal?.stop_loss} disabled={isSubmitting} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea name="description" defaultValue={signal?.description} disabled={isSubmitting} />
      </div>
      <div>
        <Label>Publish</Label>
        <Select name="is_published" defaultValue={signal?.is_published ? 'true' : 'false'} disabled={isSubmitting}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isSubmitting ? 'Saving...' : 'Save Signal'}
      </Button>
    </form>
  );
};

export default AdminCryptoSignals;
