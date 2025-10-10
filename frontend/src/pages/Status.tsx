import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Info } from 'lucide-react';
import RankBadge from '@/components/common/RankBadge';

interface RankRequirement {
  rank: string;
  teamTurnover: string;
  leg1Turnover: string;
  leg2Turnover: string;
  state: 'current' | 'next' | 'future';
}

const Status = () => {
  const rankRequirements: RankRequirement[] = [
    { rank: 'Pearl', teamTurnover: '10 000 €', leg1Turnover: '5 000 €', leg2Turnover: '3 000 €', state: 'current' },
    { rank: 'Sapphire', teamTurnover: '25 000 €', leg1Turnover: '12 500 €', leg2Turnover: '7 500 €', state: 'next' },
    { rank: 'Ruby', teamTurnover: '50 000 €', leg1Turnover: '25 000 €', leg2Turnover: '15 000 €', state: 'future' },
    { rank: 'Emerald', teamTurnover: '100 000 €', leg1Turnover: '50 000 €', leg2Turnover: '30 000 €', state: 'future' },
    { rank: 'Diamond', teamTurnover: '250 000 €', leg1Turnover: '125 000 €', leg2Turnover: '75 000 €', state: 'future' },
    { rank: 'Blue Diamond', teamTurnover: '500 000 €', leg1Turnover: '250 000 €', leg2Turnover: '150 000 €', state: 'future' },
    { rank: 'Green Diamond', teamTurnover: '1 000 000 €', leg1Turnover: '500 000 €', leg2Turnover: '300 000 €', state: 'future' },
    { rank: 'Purple Diamond', teamTurnover: '2 000 000 €', leg1Turnover: '1 000 000 €', leg2Turnover: '600 000 €', state: 'future' },
    { rank: 'Red Diamond', teamTurnover: '6 000 000 €', leg1Turnover: '3 000 000 €', leg2Turnover: '1 800 000 €', state: 'future' },
    { rank: 'Black Diamond', teamTurnover: '12 000 000 €', leg1Turnover: '6 000 000 €', leg2Turnover: '3 600 000 €', state: 'future' },
    { rank: 'Ultima Diamond', teamTurnover: '60 000 000 €', leg1Turnover: '30 000 000 €', leg2Turnover: '18 000 000 €', state: 'future' },
    { rank: 'Double Ultima Diamond', teamTurnover: '120 000 000 €', leg1Turnover: '60 000 000 €', leg2Turnover: '36 000 000 €', state: 'future' },
    { rank: 'Triple Ultima Diamond', teamTurnover: '500 000 000 €', leg1Turnover: '250 000 000 €', leg2Turnover: '150 000 000 €', state: 'future' },
    { rank: 'Billion Diamond', teamTurnover: '1 000 000 000 €', leg1Turnover: '500 000 000 €', leg2Turnover: '300 000 000 €', state: 'future' },
  ];

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
                <RankBadge rank="Pearl" showLabel size="md" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Team Turnover</p>
                <p className="text-2xl font-bold">0 EUR</p>
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
                  <RankBadge rank="Sapphire" showLabel size="md" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Rank turnover</p>
                  <p className="text-xl font-bold">25 000 EUR</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">0 / 25 000 EUR</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
                <div className="flex gap-2 mt-3">
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
                {rankRequirements.map((req, index) => (
                  <tr 
                    key={index} 
                    className={`border-b ${
                      req.state === 'current' 
                        ? 'bg-blue-50 border-blue-200' 
                        : req.state === 'next' 
                        ? 'bg-green-50 border-green-200' 
                        : ''
                    }`}
                  >
                    <td className="p-4">
                      <RankBadge rank={req.rank} showLabel size="sm" />
                    </td>
                    <td className="p-4">{req.teamTurnover}</td>
                    <td className="p-4">{req.leg1Turnover}</td>
                    <td className="p-4">{req.leg2Turnover}</td>
                    <td className="p-4">
                      {req.state === 'current' && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          Current
                        </Badge>
                      )}
                      {req.state === 'next' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Next
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Next Rank Details */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">0 / 25 000 EUR</span>
                <span className="text-sm font-medium">0%</span>
              </div>
              <Progress value={0} className="h-2" />
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-success text-white">0%</Badge>
                <Badge variant="secondary" className="bg-blue-500 text-white">0%</Badge>
                <Badge variant="secondary" className="bg-orange-500 text-white">0%</Badge>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>■ 50%</span>
                <span>■ 30%</span>
                <span>■ All Team</span>
              </div>
              <Button className="w-full mt-2">Leg Rules</Button>
            </div>

            <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                To reach the rank, your team turnover required for raising the rank must be the following proportions: no
                more than 12 500 EUR in the strongest leg, 7 500 EUR in the second strongest leg, and 5 000 EUR from all
                other legs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Status;
