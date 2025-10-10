import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Coins, Clock } from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import api from '@/lib/api';
import { Bonus } from '@/lib/types';

const Bonuses = () => {
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [filteredBonuses, setFilteredBonuses] = useState<Bonus[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    thisMonth: 0,
    pending: 0,
  });

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        const [bonusesRes, statsRes] = await Promise.all([
          api.get('/bonuses'),
          api.get('/bonuses/stats'),
        ]);

        const bonusData = bonusesRes.data?.data || [];
        setBonuses(bonusData);
        setFilteredBonuses(bonusData);
        setStats(statsRes.data || { totalEarned: 0, thisMonth: 0, pending: 0 });
      } catch (error) {
        console.error('Failed to fetch bonuses:', error);
        setBonuses([]);
        setFilteredBonuses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBonuses();
  }, []);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredBonuses(bonuses);
    } else {
      setFilteredBonuses(bonuses.filter(b => b.type === activeTab));
    }
  }, [activeTab, bonuses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = bonuses.slice(0, 7).map(b => ({
    date: formatDate(b.createdAt),
    amount: b.amount,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bonuses</h1>
        <p className="text-muted-foreground">Track your earnings and bonus history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Earned"
          value={formatCurrency(stats.totalEarned)}
          icon={TrendingUp}
        />
        <StatCard
          title="This Month"
          value={formatCurrency(stats.thisMonth)}
          icon={Coins}
        />
        <StatCard
          title="Pending"
          value={formatCurrency(stats.pending)}
          icon={Clock}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bonus Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bonus History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unilevel">Unilevel</TabsTrigger>
              <TabsTrigger value="rank">Rank</TabsTrigger>
              <TabsTrigger value="infinity">Infinity</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Source</th>
                      <th className="text-left p-4 font-medium">Level</th>
                      <th className="text-right p-4 font-medium">Amount</th>
                      <th className="text-center p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBonuses.map((bonus) => (
                      <tr key={bonus.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <p className="text-sm">{formatDate(bonus.createdAt)}</p>
                        </td>
                        <td className="p-4">
                          <span className="capitalize">{bonus.type}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{bonus.sourceUserName}</p>
                        </td>
                        <td className="p-4">
                          {bonus.level ? `Level ${bonus.level}` : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <p className="font-semibold text-success">
                            {formatCurrency(bonus.amount, bonus.currency)}
                          </p>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            bonus.status === 'paid' 
                              ? 'bg-success/10 text-success' 
                              : 'bg-yellow-500/10 text-yellow-500'
                          }`}>
                            {bonus.status === 'paid' ? 'Completed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBonuses.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No bonuses found</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bonuses;
