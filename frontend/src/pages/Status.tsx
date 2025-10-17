import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Info, Loader2 } from 'lucide-react';
import RankBadge from '@/components/common/RankBadge';
import { useRanks, useRankProgress } from '@/hooks/useApi';
import { RankResponse, RankProgress } from '@/types/rank';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';

const Status = () => {
  const navigate = useNavigate();
  const { data: ranks, isLoading: ranksLoading } = useRanks();
  const { data: progress, isLoading: progressLoading } = useRankProgress();
  
  const { data: bonusConfig, isLoading: configLoading } = useQuery({
    queryKey: ['bonusConfig'],
    queryFn: async () => {
      const response = await api.get('/admin/config/config/public/payout-settings');
      return response.data;
    },
  });
  
  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!bonusConfig?.rank_bonus_enabled) {
    navigate('/dashboard');
    return null;
  }

  if (ranksLoading || progressLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Status</h1>
        <p className="text-muted-foreground">
          It is awarded according to the rank status scheme. The status is earned automatically when a certain status
          turnover is reached. This status is awarded once when a certain rank is reached.
        </p>
      </div>

      {/* Current Status and Next Rank */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Status */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">My Status</p>
                {progress?.current_rank && <RankBadge rank={progress.current_rank.name} showLabel size="md" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Team Turnover</p>
                <p className="text-2xl font-bold">₦{progress?.total_turnover?.toFixed(0) || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Rank */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Next rank</p>
                  {progress?.next_rank && <RankBadge rank={progress.next_rank.name} showLabel size="md" />}
                </div>
                {progress?.next_rank && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Rank turnover</p>
                    <p className="text-xl font-bold">₦{progress.next_rank.team_turnover_required.toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {progress?.next_rank && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">
                      ₦{progress.total_turnover.toFixed(0)} / ₦{progress.next_rank.team_turnover_required.toLocaleString()}
                    </span>
                    <span>{progress.overall_progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress.overall_progress} className="h-2" />
                  <div className="flex gap-2 mt-3">
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

      {/* Rank Requirements Table */}
      <Card>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Team turnover</th>
                  <th className="text-left p-4 font-medium">
                    <div>1st line Turnover</div>
                    <div className="text-xs font-normal text-muted-foreground">50% rule</div>
                  </th>
                  <th className="text-left p-4 font-medium">30% rule</th>
                  <th className="text-left p-4 font-medium">State</th>
                </tr>
              </thead>
              <tbody>
                {ranks?.map((rank: RankResponse, index: number) => {
                  const isCurrent = rank.name === progress?.current_rank?.name;
                  const isNext = rank.name === progress?.next_rank?.name;
                  
                  return (
                    <tr 
                      key={rank.id} 
                      className={`border-b ${
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
                      <td className="p-4">
                        {isCurrent && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            Current
                          </Badge>
                        )}
                        {isNext && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
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

          {/* Next Rank Details */}
          {progress?.next_rank && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    ₦{progress.total_turnover.toFixed(0)} / ₦{progress.next_rank.team_turnover_required.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium">{progress.overall_progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress.overall_progress} className="h-2" />
                <div className="flex gap-2">
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
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>■ First Leg (50% max)</span>
                  <span>■ Second Leg (30% max)</span>
                  <span>■ Other Legs</span>
                </div>
                <Button className="w-full mt-2">Leg Rules</Button>
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-2">To reach {progress.next_rank.name} rank:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>First Leg: Max ₦{progress.next_rank.first_leg_requirement.toLocaleString()}</li>
                    <li>Second Leg: Max ₦{progress.next_rank.second_leg_requirement.toLocaleString()}</li>
                    <li>Other Legs: Min ₦{progress.next_rank.other_legs_requirement.toLocaleString()}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Status;
