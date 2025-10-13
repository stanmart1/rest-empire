import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/formatters';
import RankBadge from '@/components/common/RankBadge';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRanks, useRankProgress } from '@/hooks/useApi';

const RankBonus = () => {
  const { data: ranks, isLoading: ranksLoading } = useRanks();
  const { data: progress, isLoading: progressLoading } = useRankProgress();

  if (ranksLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }



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
                  {progress?.current_rank && <RankBadge rank={progress.current_rank.name} showLabel size="md" />}
                </div>
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Rank bonus</p>
                <p className="text-2xl font-bold">₦{progress?.current_rank?.bonus_amount?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Team Turnover</p>
                <p className="text-xl font-semibold">₦{progress?.total_turnover?.toFixed(0) || '0'}</p>
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
                  {progress?.next_rank && <RankBadge rank={progress.next_rank.name} showLabel size="md" />}
                </div>
                {progress?.next_rank && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Bonus turnover</p>
                    <p className="text-xl font-bold">₦{progress.next_rank.team_turnover_required.toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {progress?.next_rank && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Rank bonus</p>
                  <p className="text-2xl font-bold text-success">₦{progress.next_rank.bonus_amount.toLocaleString()}</p>
                </div>
              )}

              {progress?.next_rank && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₦{progress.total_turnover.toFixed(0)} / ₦{progress.next_rank.team_turnover_required.toLocaleString()}
                    </span>
                    <span className="font-medium">{progress.overall_progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress.overall_progress} className="h-2" />
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="bg-success text-white">
                      {progress.first_leg_progress.toFixed(0)}%
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-500 text-white">
                      {progress.second_leg_progress.toFixed(0)}%
                    </Badge>
                    <Badge variant="secondary" className="bg-orange-500 text-white">
                      {progress.other_legs_progress.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span>■ First Leg (50% max)</span>
                    <span>■ Second Leg (30% max)</span>
                    <span>■ Other Legs</span>
                  </div>
                </div>
              )}

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
                  <th className="text-left p-4 font-medium">Bonus, NGN</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ranks?.map((rank: any) => {
                  const isCurrent = rank.name === progress?.current_rank?.name;
                  const isNext = rank.name === progress?.next_rank?.name;
                  
                  return (
                    <tr 
                      key={rank.id} 
                      className={`border-b hover:bg-muted/50 ${
                        isCurrent 
                          ? 'bg-blue-50 border-blue-200' 
                          : isNext 
                          ? 'bg-green-50 border-green-200' 
                          : ''
                      }`}
                    >
                      <td className="p-4">
                        <RankBadge rank={rank.name} showLabel size="sm" />
                      </td>
                      <td className="p-4">₦{rank.team_turnover_required.toLocaleString()}</td>
                      <td className="p-4">₦{rank.first_leg_requirement.toLocaleString()}</td>
                      <td className="p-4">₦{rank.second_leg_requirement.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-success">{rank.bonus_amount.toLocaleString()}</td>
                      <td className="p-4">
                        {isCurrent && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                            Current
                          </Badge>
                        )}
                        {isNext && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            Next
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RankBonus;
