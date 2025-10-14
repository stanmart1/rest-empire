import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, AlertTriangle, TrendingUpIcon } from 'lucide-react';
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
  created_at: string;
}

const CryptoSignals = () => {
  const formatPrice = (price: string | undefined) => {
    if (!price) return '-';
    const num = parseFloat(price);
    return num >= 1 ? `$${num.toFixed(2)}` : `$${num.toFixed(8)}`;
  };

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['crypto-signals'],
    queryFn: async () => {
      const response = await api.get('/crypto/signals/published');
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Crypto Trading Signals</h1>
        <p className="text-muted-foreground mt-2">Expert trading signals for cryptocurrency markets</p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Loading signals...</p>
          </CardContent>
        </Card>
      ) : signals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <TrendingUpIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No Active Signals</h3>
                <p className="text-muted-foreground text-sm">
                  There are no published trading signals at the moment. Check back later for new opportunities.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {signals.map((signal: CryptoSignal) => (
            <Card key={signal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{signal.coin}</CardTitle>
                  <Badge variant={signal.signal_type === 'buy' ? 'default' : signal.signal_type === 'sell' ? 'destructive' : 'secondary'}>
                    {signal.signal_type === 'buy' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : signal.signal_type === 'sell' ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : null}
                    {signal.signal_type.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Entry Price</span>
                    <span className="font-semibold">{formatPrice(signal.entry_price)}</span>
                  </div>
                  
                  {signal.target_price && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Target
                      </span>
                      <span className="font-semibold text-green-600">{formatPrice(signal.target_price)}</span>
                    </div>
                  )}
                  
                  {signal.stop_loss && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Stop Loss
                      </span>
                      <span className="font-semibold text-red-600">{formatPrice(signal.stop_loss)}</span>
                    </div>
                  )}
                </div>

                {signal.description && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground">{signal.description}</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2">
                  {new Date(signal.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoSignals;
