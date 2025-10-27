import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, Wallet, CircleDot, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RankBadge from '@/components/common/RankBadge';
import { useDashboardStats } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const Dashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  
  const { data: bonusConfig } = useQuery({
    queryKey: ['bonusConfig'],
    queryFn: async () => {
      const response = await api.get('/admin/config/config/public/payout-settings');
      return response.data;
    },
  });
  
  const rankBonusEnabled = bonusConfig?.rank_bonus_enabled;

  const referralLink = user?.referral_code 
    ? `${window.location.origin}/register?ref=${user.referral_code}`
    : `${window.location.origin}/register`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500">Error loading dashboard</p>
          <p className="text-sm text-muted-foreground mt-2">{statsError?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  const rankProgress = dashboardStats?.rank_progress;
  const progressPercentage = rankProgress?.percentage || 0;
  const currentTurnover = rankProgress?.current_turnover || 0;
  const nextRequirement = rankProgress?.next_requirement;
  const nextRank = rankProgress?.next_rank;

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
                <p className="text-sm text-muted-foreground">NGN Balance</p>
                <p className="text-2xl font-bold">
                  ₦{dashboardStats?.balance_ngn?.toLocaleString() || '0.00'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <Button size="sm" variant="outline" onClick={() => navigate('/payouts')}>
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
                <p className="text-sm text-muted-foreground">USDT Balance</p>
                <p className="text-2xl font-bold">
                  ${dashboardStats?.balance_usdt?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <Button size="sm" variant="outline" onClick={() => navigate('/payouts')}>
                  Payout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Status */}
      {rankBonusEnabled && (
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
              <div className="text-right">
                <Badge variant={dashboardStats?.is_active ? "default" : "secondary"}>
                  <CircleDot className="w-3 h-3 mr-1" />
                  {dashboardStats?.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {dashboardStats?.is_active && dashboardStats?.activated_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    since {new Date(dashboardStats.activated_at).toLocaleDateString()}
                  </p>
                )}
                {!dashboardStats?.is_active && dashboardStats?.deactivated_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    since {new Date(dashboardStats.deactivated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* Rank Progress */}
            {nextRank && nextRequirement && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress to next rank</span>
                  <span>{progressPercentage.toFixed(0)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₦{currentTurnover.toLocaleString()} / ₦{nextRequirement.toLocaleString()}</span>
                  <span>Next: {nextRank}</span>
                </div>
              </div>
            )}
            
            {!nextRank && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">🎉 Maximum rank achieved!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  ₦{dashboardStats?.total_earnings?.toLocaleString() || '0'}
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
                ₦{dashboardStats?.recent_earnings_30d?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Pending Payouts</p>
              <p className="text-lg font-semibold">
                ₦{dashboardStats?.pending_payouts?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;