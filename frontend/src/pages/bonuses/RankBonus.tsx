import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import RankBadge from '@/components/common/RankBadge';
import { CheckCircle } from 'lucide-react';
import api from '@/lib/api';

interface RankBonusData {
  currentRank: string;
  nextRank: string;
  bonusTurnover: number;
  currentBonus: number;
  nextBonus: number;
  totalTeamTurnover: number;
  requiredTurnover: number;
  leg1Turnover: number;
  leg2Turnover: number;
  requiredLeg1: number;
  requiredLeg2: number;
  progress: number;
}

const RankBonus = () => {
  const [bonusData, setBonusData] = useState<RankBonusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankBonus = async () => {
      try {
        const res = await api.get('/bonuses/rank');
        setBonusData(res.data);
      } catch (error) {
        console.error('Failed to fetch rank bonus:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankBonus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const rankBonuses = [
    { rank: 'Diamond', teamTurnover: '250 000 €', leg1: '125 000 €', leg2: '75 000 €', bonus: '5 000', status: '' },
    { rank: 'Blue Diamond', teamTurnover: '500 000 €', leg1: '250 000 €', leg2: '150 000 €', bonus: '5 000', status: '' },
    { rank: 'Green Diamond', teamTurnover: '1 000 000 €', leg1: '500 000 €', leg2: '300 000 €', bonus: '10 000', status: '' },
    { rank: 'Purple Diamond', teamTurnover: '2 000 000 €', leg1: '1 000 000 €', leg2: '600 000 €', bonus: '20 000', status: '' },
    { rank: 'Red Diamond', teamTurnover: '6 000 000 €', leg1: '3 000 000 €', leg2: '1 800 000 €', bonus: '80 000', status: '' },
    { rank: 'Black Diamond', teamTurnover: '12 000 000 €', leg1: '6 000 000 €', leg2: '3 600 000 €', bonus: '120 000', status: '' },
    { rank: 'Ultima Diamond', teamTurnover: '60 000 000 €', leg1: '30 000 000 €', leg2: '18 000 000 €', bonus: '960 000', status: '' },
    { rank: 'Double Ultima Diamond', teamTurnover: '120 000 000 €', leg1: '60 000 000 €', leg2: '36 000 000 €', bonus: '1 200 000', status: '' },
    { rank: 'Triple Ultima Diamond', teamTurnover: '500 000 000 €', leg1: '250 000 000 €', leg2: '150 000 000 €', bonus: '7 600 000', status: '' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Rank bonus</h1>
        <p className="text-muted-foreground">
          It is awarded according to the rank bonus scheme. The bonus is earned automatically when a certain rank is reached. This bonus is awarded once when a certain rank is reached.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Bonus */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Current Bonus</p>
                  <RankBadge rank="Amber" showLabel size="md" />
                </div>
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rank bonus</p>
                <p className="text-2xl font-bold">0 EUR</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Team Turnover</p>
                <p className="text-xl font-semibold">0 EUR</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Bonus */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Next Bonus</p>
                  <RankBadge rank="Jade" showLabel size="md" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Bonus turnover</p>
                  <p className="text-xl font-bold">5 000 EUR</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Rank bonus</p>
                <p className="text-2xl font-bold text-success">0 EUR</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">0 / 5 000 EUR</span>
                  <span className="font-medium">0%</span>
                </div>
                <Progress value={0} className="h-2" />
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary" className="bg-success text-white">0%</Badge>
                  <Badge variant="secondary" className="bg-blue-500 text-white">0%</Badge>
                  <Badge variant="secondary" className="bg-orange-500 text-white">0%</Badge>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                  <span>■ 50%</span>
                  <span>■ 30%</span>
                  <span>■ All Team</span>
                </div>
              </div>

              <Button className="w-full">Leg Rules</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Bonus Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Rank</th>
                  <th className="text-left p-4 font-medium">Team turnover</th>
                  <th className="text-left p-4 font-medium">
                    <div>1st line Turnover</div>
                    <div className="text-xs font-normal text-muted-foreground">50% rule</div>
                  </th>
                  <th className="text-left p-4 font-medium">30% rule</th>
                  <th className="text-left p-4 font-medium">Bonus, EUR</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rankBonuses.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <RankBadge rank={item.rank} showLabel size="sm" />
                    </td>
                    <td className="p-4">{item.teamTurnover}</td>
                    <td className="p-4">{item.leg1}</td>
                    <td className="p-4">{item.leg2}</td>
                    <td className="p-4 font-semibold text-success">{item.bonus}</td>
                    <td className="p-4">
                      {item.status && (
                        <Badge variant="outline" className="bg-green-50 text-success border-success">{item.status}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankBonus;
