import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Infinity, TrendingUp, Loader2 } from 'lucide-react';
import RankBadge from '@/components/common/RankBadge';
import { useBonuses, useBonusSummary, useRankProgress } from '@/hooks/useApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Bonus } from '@/lib/types';

const InfinityBonus = () => {
  const [selectedMonth, setSelectedMonth] = useState('October 2025');
  const { data: bonuses, isLoading: bonusesLoading } = useBonuses({ type: 'infinity' });
  const { data: summary, isLoading: summaryLoading } = useBonusSummary('30d');
  const { data: progress, isLoading: progressLoading } = useRankProgress();

  if (bonusesLoading || summaryLoading || progressLoading) {
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
          <h1 className="text-3xl font-bold mb-2">Infinity Bonus</h1>
          <p className="text-muted-foreground">Unlimited passive profit opportunity</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="October 2025">October 2025</SelectItem>
            <SelectItem value="September 2025">September 2025</SelectItem>
            <SelectItem value="August 2025">August 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="infinity" className="w-full">
        <TabsList>
          <TabsTrigger value="infinity">Infinity Bonus</TabsTrigger>
          <TabsTrigger value="history">Bonus History</TabsTrigger>
        </TabsList>

        <TabsContent value="infinity" className="space-y-6">
          {/* Countdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Countdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8 py-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">28</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="text-3xl">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold">01</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-3xl">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold">51</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-3xl">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold">09</div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your bonus */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your bonus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">
                  {formatCurrency(summary?.infinity_bonuses || 0)}
                </div>
              </CardContent>
            </Card>

            {/* Bonus Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bonus Status</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold">Goal not reached</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current rank */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current rank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset="283"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">0%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  {progress?.current_rank && <RankBadge rank={progress.current_rank.name} showLabel />}
                </div>
              </CardContent>
            </Card>

            {/* Turnover */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Turnover</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {progress?.next_rank && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span>₦{progress.total_turnover.toFixed(0)} / ₦{progress.next_rank.team_turnover_required.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{progress.overall_progress.toFixed(0)}%</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      <Badge className="bg-success">{progress.first_leg_progress.toFixed(0)}%</Badge>
                      <Badge className="bg-blue-500">{progress.second_leg_progress.toFixed(0)}%</Badge>
                      <Badge className="bg-warning">{progress.other_legs_progress.toFixed(0)}%</Badge>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>■ First Leg (50% max)</span>
                      <span>■ Second Leg (30% max)</span>
                      <span>■ Other Legs</span>
                    </div>
                  </div>
                )}
                <Button className="w-full">Leg Rules</Button>
              </CardContent>
            </Card>

            {/* Turnover of levels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Turnover of levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">1st level</span>
                  <span className="font-medium">₦{progress?.first_leg_turnover?.toFixed(0) || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">2nd level</span>
                  <span className="font-medium">₦{progress?.second_leg_turnover?.toFixed(0) || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">3rd level</span>
                  <span className="font-medium">₦{progress?.other_legs_turnover?.toFixed(0) || '0'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bonus description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Infinity className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Bonus description</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Infinity Bonus gives our most active partners an opportunity to receive an unlimited passive profit ranging from 10% to 25%. This bonus is applied to all purchases regardless of the team depth.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <img src="/placeholder.svg" alt="Triple ULTIMA Diamond" className="w-full h-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">Triple ULTIMA<br/>Diamond</p>
                  <p className="font-bold text-lg">23%</p>
                </div>
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <img src="/placeholder.svg" alt="Diamond" className="w-full h-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">Diamond</p>
                  <p className="font-bold text-lg">10%</p>
                </div>
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <img src="/placeholder.svg" alt="Blue Diamond" className="w-full h-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">Blue<br/>Diamond</p>
                  <p className="font-bold text-lg">11%</p>
                </div>
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <img src="/placeholder.svg" alt="Double ULTIMA" className="w-full h-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">Double ULTIMA<br/>Diamond</p>
                  <p className="font-bold text-lg">21%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Rank</th>
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
                          {bonus.rank_achieved && <RankBadge rank={bonus.rank_achieved} size="sm" />}
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
                  <p className="text-center text-muted-foreground py-8">No infinity bonus history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfinityBonus;
