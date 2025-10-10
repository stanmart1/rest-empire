import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, QrCode, Euro, Gem, CircleDot, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import RankBadge from '@/components/common/RankBadge';

const Dashboard = () => {
  const { toast } = useToast();
  const referralLink = "https://restempire.com/partner/znrp59sa";

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

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

      {/* My available balance */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">My available balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Euro className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">EUR</span>
              </div>
              <p className="text-3xl font-bold mb-4 text-foreground">0</p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Payout Request",
                    description: "Insufficient balance for payout",
                  });
                }}
              >
                Payout
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gem className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">DBSP</span>
              </div>
              <p className="text-3xl font-bold mb-4 text-foreground">0</p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  toast({
                    title: "Payout Request",
                    description: "Insufficient balance for payout",
                  });
                }}
              >
                Payout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Status & Rank */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">My Status & Rank</h2>
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
                  <p className="text-sm text-muted-foreground mb-1">Turnover</p>
                  <p className="text-2xl font-bold text-foreground">0 EUR</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Next Rank Bonus */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">My Next Rank Bonus</p>
                    <RankBadge rank="Sapphire" showLabel size="md" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">0 / 25 000 EUR</p>
                    <p className="text-lg font-semibold text-foreground">0%</p>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Rank bonus</p>
                  <p className="text-2xl font-bold text-primary">0 EUR</p>
                </div>

                <div className="space-y-2">
                  <Progress value={0} className="h-2" />
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">0%</Badge>
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground">0%</Badge>
                    <Badge variant="secondary" className="bg-muted text-foreground">0%</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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
      </div>

      {/* My Team & Infinity Bonus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Team */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">My Team</h3>
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="w-12 h-12">
                <AvatarFallback>PA</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">Peter Adelodun</p>
                <p className="text-sm text-muted-foreground">Not verified</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-muted-foreground">First Line</span>
                <span className="text-2xl font-bold text-foreground">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">All Team</span>
                <span className="text-2xl font-bold text-foreground">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infinity Bonus */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Infinity Bonus</h3>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="relative w-40 h-40 mb-4 sm:w-48 sm:h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${0 * 4.4} ${440 - 0 * 4.4}`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-muted-foreground">0%</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <CircleDot className="w-4 h-4" />
                <span>Diamond</span>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Your bonus</p>
                <p className="text-3xl font-bold text-foreground">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;