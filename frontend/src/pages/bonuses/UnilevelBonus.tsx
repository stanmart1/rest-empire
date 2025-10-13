import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { useBonuses, useBonusSummary } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Bonus } from '@/lib/types';

const UnilevelBonus = () => {
  const { data: bonuses, isLoading: bonusesLoading } = useBonuses({ type: 'unilevel' });
  const { data: summary, isLoading: summaryLoading } = useBonusSummary('30d');

  if (bonusesLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const distributionData = [
    { label: 'Direct bonus', level: 'Level 1', percentage: 40, color: 'bg-blue-600' },
    { label: 'Team Bonus', level: 'Level 2', percentage: 7, color: 'bg-purple-500' },
    { label: '', level: 'Level 3', percentage: 5, color: 'bg-pink-500' },
    { label: '', level: 'Level 4-5', percentage: 3, color: 'bg-cyan-400' },
    { label: '', level: 'Level 6-15', percentage: 1, color: 'bg-navy-900' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Unilevel Bonus</h1>
        <p className="text-muted-foreground">Multi-level bonus distribution structure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribution of Percentage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distributionData.map((item, index) => (
                <div key={index} className="space-y-1">
                  {item.label && (
                    <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  )}
                  <div className={`${item.color} text-white p-3 rounded-lg flex justify-between items-center`}>
                    <span className="text-sm">{item.level}</span>
                    <span className="text-2xl font-bold">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart Visualization */}
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <div className="relative w-64 h-64">
              {/* Simplified pie chart representation */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="40" />
                {/* Blue segment - 40% */}
                <circle 
                  cx="100" cy="100" r="80" 
                  fill="none" 
                  stroke="#2563eb" 
                  strokeWidth="40"
                  strokeDasharray="201 503"
                  transform="rotate(-90 100 100)"
                />
                {/* Purple segment - 7% */}
                <circle 
                  cx="100" cy="100" r="80" 
                  fill="none" 
                  stroke="#a855f7" 
                  strokeWidth="40"
                  strokeDasharray="35 468"
                  strokeDashoffset="-201"
                  transform="rotate(-90 100 100)"
                />
                {/* Pink segment - 5% */}
                <circle 
                  cx="100" cy="100" r="80" 
                  fill="none" 
                  stroke="#ec4899" 
                  strokeWidth="40"
                  strokeDasharray="25 478"
                  strokeDashoffset="-236"
                  transform="rotate(-90 100 100)"
                />
                <text x="100" y="105" textAnchor="middle" className="text-2xl font-bold fill-blue-600">40%</text>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Compression */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Dynamic Compression</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <span className="font-semibold">Dynamic compression</span> assigns bonuses only to our active partners without taking the inactive partners into consideration.
          </p>
          
          <div className="space-y-3">
            <p className="font-medium">What is the difference between active and inactive partners?</p>
            <p className="text-muted-foreground">
              To receive commission and bonuses, you need to maintain your active partner status.
            </p>
            
            <p className="font-medium">How can you start receiving bonuses?</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Pay for products in USDT to start participation in marketing program. This will activate your status for 30 days.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  If your first-line partner makes a first payment using USDT. Please note that only the first payment is taken into consideration. (this rule only works if a personal purchase was made)
                </p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Each action extends your 'active' status for 30 days from payment. At least one condition should be fulfilled to maintain active partner status.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bonus History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Unilevel Bonus History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.unilevel_bonuses || 0)}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.total_bonuses || 0)}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Bonuses</p>
                <p className="text-2xl font-bold">{bonuses?.length || 0}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Level</th>
                    <th className="text-left p-3 font-medium">Source</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bonuses?.map((bonus: Bonus) => (
                    <tr key={bonus.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">{formatDate(bonus.created_at)}</td>
                      <td className="p-3">
                        <Badge variant="secondary">Level {bonus.level || 1}</Badge>
                      </td>
                      <td className="p-3 text-sm">{bonus.source_user_name || 'N/A'}</td>
                      <td className="p-3 text-right font-semibold text-success">
                        {formatCurrency(bonus.amount, bonus.currency)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={bonus.status === 'paid' ? 'default' : 'secondary'}>
                          {bonus.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!bonuses?.length && (
                <p className="text-center text-muted-foreground py-8">No unilevel bonuses yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnilevelBonus;
