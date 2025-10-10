import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RankBadge from '@/components/common/RankBadge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import api from '@/lib/api';
import { Rank } from '@/lib/types';
import { Check } from 'lucide-react';

const Ranks = () => {
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [currentRank, setCurrentRank] = useState<Rank | null>(null);
  const [rankHistory, setRankHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanks = async () => {
      try {
        const [ranksRes, currentRes, historyRes] = await Promise.all([
          api.get('/ranks'),
          api.get('/ranks/current'),
          api.get('/ranks/history'),
        ]);

        setRanks(ranksRes.data || []);
        setCurrentRank(currentRes.data?.rank || null);
        setRankHistory(historyRes.data || []);
      } catch (error) {
        console.error('Failed to fetch ranks:', error);
        setRanks([]);
        setRankHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanks();
  }, []);

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
        <h1 className="text-3xl font-bold">Rank System</h1>
        <p className="text-muted-foreground">Track your rank progression and requirements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rank Ladder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ranks.map((rank, index) => {
              const isCurrent = currentRank?.name === rank.name;
              const isAchieved = currentRank ? currentRank.level >= rank.level : false;

              return (
                <div
                  key={rank.name}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : isAchieved
                      ? 'border-success/30 bg-success/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <RankBadge rank={rank.name} size="lg" />
                      <div>
                        <h3 className="text-xl font-bold">{rank.name}</h3>
                        <p className="text-sm text-muted-foreground">Level {rank.level}</p>
                      </div>
                      {isAchieved && (
                        <div className="flex items-center gap-2 text-success">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">Achieved</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Rank Bonus</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(rank.bonus)}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Requirements:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Total Turnover: {formatCurrency(rank.requiredTurnover)}</li>
                        <li>• Leg 1 (50%): {formatCurrency(rank.requiredLeg1)}</li>
                        <li>• Leg 2 (30%): {formatCurrency(rank.requiredLeg2)}</li>
                        <li>• Leg 3 (20%): {formatCurrency(rank.requiredLeg3)}</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Benefits:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Rank Achievement Bonus</li>
                        <li>• Increased Unilevel Percentages</li>
                        <li>• Infinity Bonus Eligibility</li>
                        <li>• Leadership Recognition</li>
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rank History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rankHistory.map((history) => (
              <div
                key={history.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-4">
                  <RankBadge rank={history.rank} />
                  <div>
                    <p className="font-medium">{history.rank}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(history.achievedAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Bonus Earned</p>
                  <p className="text-lg font-bold text-success">
                    {formatCurrency(history.bonusEarned)}
                  </p>
                </div>
              </div>
            ))}
            {rankHistory.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No rank history yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ranks;
