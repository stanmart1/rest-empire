import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, QrCode, Euro, Gem, CircleDot, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import RankBadge from '@/components/common/RankBadge';
import { useDashboardStats, useTeamStats } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardStats, TeamStats } from '@/types/dashboard';

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const { data: teamStats, isLoading: teamLoading } = useTeamStats();

  const referralLink = user?.referral_code 
    ? `https://restempire.com/register?ref=${user.referral_code}`
    : "https://restempire.com/register";

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  if (statsLoading || teamLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground">Referral link</span>
              <span className="text-sm font-medium break-all text-foreground">{referralLink}</span>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" onClick={copyReferralLink}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => {
                  toast({
                    title: "QR Code",
                    description: "QR code feature coming soon",
                  });
                }}
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">
                  €{dashboardStats?.balance_eur?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="w-5 h-5 text-blue-600" />
                <Button size="sm" variant="outline">
                  Payout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">DBSP Balance</p>
                <p className="text-2xl font-bold">
                  {dashboardStats?.balance_dbsp?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-purple-600" />
                <Button size="sm" variant="outline">
                  Payout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <RankBadge rank={dashboardStats?.current_rank || 'Amber'} />
              <div>
                <h3 className="font-semibold">{dashboardStats?.current_rank || 'Amber'}</h3>
                <p className="text-sm text-muted-foreground">Current Rank</p>
              </div>
            </div>
            <Badge variant="secondary">
              <CircleDot className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>

          {/* Rank Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progress to next rank</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>€{teamStats?.total_turnover?.toFixed(0) || '0'} / €25,000</span>
              <span>Next: Sapphire</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardStats?.team_size || 0}</p>
                <p className="text-sm text-muted-foreground">Total Team</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Info className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dashboardStats?.first_line_count || 0}</p>
                <p className="text-sm text-muted-foreground">First Line</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Euro className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  €{dashboardStats?.total_earnings?.toFixed(0) || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Earnings */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Recent Earnings (30 days)</h3>
              <p className="text-2xl font-bold text-green-600">
                €{dashboardStats?.recent_earnings_30d?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
              <p className="text-lg font-semibold">
                €{dashboardStats?.pending_payouts?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;