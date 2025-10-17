import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useBonusSettings, useUpdateBonusSettings } from '@/hooks/useAdminBonus';

const BonusConfiguration = () => {
  const { data: settings, isLoading } = useBonusSettings();
  const updateMutation = useUpdateBonusSettings();

  const [unilevelEnabled, setUnilevelEnabled] = useState(false);
  const [unilevelPercentages, setUnilevelPercentages] = useState<number[]>(Array(15).fill(0));
  
  const [rankBonusEnabled, setRankBonusEnabled] = useState(false);
  const [rankAmounts, setRankAmounts] = useState<Record<string, number>>({});
  
  const [infinityEnabled, setInfinityEnabled] = useState(false);
  const [infinityPercentage, setInfinityPercentage] = useState(0);

  const ranks = ['Pearl', 'Sapphire', 'Ruby', 'Emerald', 'Diamond', 'Blue Diamond', 'Green Diamond', 'Purple Diamond', 'Red Diamond', 'Black Diamond', 'Ultima Diamond', 'Double Ultima Diamond', 'Triple Ultima Diamond', 'Billion Diamond'];

  useEffect(() => {
    if (settings) {
      setUnilevelEnabled(settings.unilevel?.enabled || false);
      setUnilevelPercentages(settings.unilevel?.percentages || Array(15).fill(0));
      setRankBonusEnabled(settings.rank_bonus?.enabled || false);
      setRankAmounts(settings.rank_bonus?.amounts || {});
      setInfinityEnabled(settings.infinity_bonus?.enabled || false);
      setInfinityPercentage(settings.infinity_bonus?.percentage || 0);
    }
  }, [settings]);

  const handleSaveUnilevel = () => {
    updateMutation.mutate({
      unilevel: { enabled: unilevelEnabled, percentages: unilevelPercentages }
    });
  };

  const handleSaveRankBonus = () => {
    updateMutation.mutate({
      rank_bonus: { enabled: rankBonusEnabled, amounts: rankAmounts }
    });
  };

  const handleSaveInfinity = () => {
    updateMutation.mutate({
      infinity_bonus: { enabled: infinityEnabled, percentage: infinityPercentage }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Unilevel Bonus</CardTitle>
          <CardDescription>Configure percentages for 15 levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Unilevel Bonus</Label>
            <Switch checked={unilevelEnabled} onCheckedChange={setUnilevelEnabled} />
          </div>
          {unilevelEnabled && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {unilevelPercentages.map((percentage, i) => (
                  <div key={i}>
                    <Label className="text-xs">Level {i + 1} (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={percentage}
                      onChange={(e) => {
                        const newPercentages = [...unilevelPercentages];
                        newPercentages[i] = parseFloat(e.target.value) || 0;
                        setUnilevelPercentages(newPercentages);
                      }}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveUnilevel} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Unilevel Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rank Bonus</CardTitle>
          <CardDescription>Configure bonus amounts per rank</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Rank Bonus</Label>
            <Switch checked={rankBonusEnabled} onCheckedChange={setRankBonusEnabled} />
          </div>
          {rankBonusEnabled && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {ranks.map((rank) => (
                  <div key={rank}>
                    <Label className="text-xs">{rank} (₦)</Label>
                    <Input
                      type="number"
                      value={rankAmounts[rank] || 0}
                      onChange={(e) => {
                        setRankAmounts({ ...rankAmounts, [rank]: parseFloat(e.target.value) || 0 });
                      }}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleSaveRankBonus} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Rank Bonus Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Infinity Bonus</CardTitle>
          <CardDescription>Configure percentage from company volume</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Infinity Bonus</Label>
            <Switch checked={infinityEnabled} onCheckedChange={setInfinityEnabled} />
          </div>
          {infinityEnabled && (
            <>
              <div>
                <Label>Percentage from Company Volume (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={infinityPercentage}
                  onChange={(e) => setInfinityPercentage(parseFloat(e.target.value) || 0)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSaveInfinity} disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Infinity Bonus Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BonusConfiguration;
