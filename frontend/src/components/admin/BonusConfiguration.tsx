import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useBonusSettings, useUpdateBonusSettings } from '@/hooks/useAdminBonus';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

const BonusConfiguration = () => {
  const { data: settings, isLoading } = useBonusSettings();
  const [activeTab, setActiveTab] = useState('bonuses');
  const updateMutation = useUpdateBonusSettings();

  const [unilevelEnabled, setUnilevelEnabled] = useState(false);
  const [unilevelPercentages, setUnilevelPercentages] = useState<number[]>(Array(15).fill(0));
  
  const [rankBonusEnabled, setRankBonusEnabled] = useState(false);
  const [rankAmounts, setRankAmounts] = useState<Record<string, number>>({});
  
  const [infinityEnabled, setInfinityEnabled] = useState(false);
  const [infinityPercentage, setInfinityPercentage] = useState(0);
  
  const [rankRequirements, setRankRequirements] = useState<Record<string, any>>({});

  const ranks = ['Amber', 'Jade', 'Pearl', 'Sapphire', 'Ruby', 'Emerald', 'Diamond', 'Blue Diamond', 'Green Diamond', 'Purple Diamond', 'Red Diamond', 'Black Diamond', 'Ultima Diamond', 'Double Ultima Diamond', 'Triple Ultima Diamond', 'Billion Diamond'];
  
  const queryClient = useQueryClient();

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

  const handleSaveAll = () => {
    updateMutation.mutate({
      unilevel: { enabled: unilevelEnabled, percentages: unilevelPercentages },
      rank_bonus: { enabled: rankBonusEnabled, amounts: rankAmounts },
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
    <Tabs defaultValue="bonuses" className="space-y-4" onValueChange={setActiveTab}>
      <TabsList className="bg-transparent border-b rounded-none h-auto p-0 space-x-6">
        <TabsTrigger 
          value="bonuses" 
          className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-2"
        >
          Bonus Amounts
        </TabsTrigger>
        <TabsTrigger 
          value="requirements" 
          className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none pb-2"
        >
          Rank Requirements
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="bonuses" className="space-y-4">
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

      <Button onClick={handleSaveAll} disabled={updateMutation.isPending} className="w-full">
        {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Save All Bonus Settings
      </Button>
      </TabsContent>
      
      <TabsContent value="requirements" className="space-y-4">
        {activeTab === 'requirements' && <RankRequirementsTab ranks={ranks} />}
      </TabsContent>
    </Tabs>
  );
};

const RankRequirementsTab = ({ ranks }: { ranks: string[] }) => {
  const [rankRequirements, setRankRequirements] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();
  
  const { data: ranksData, isLoading: ranksLoading } = useQuery({
    queryKey: ['ranks'],
    queryFn: async () => {
      const response = await api.get('/ranks');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const updateRanksMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put('/admin/ranks/bulk-update', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranks'] });
      toast.success('Rank requirements updated successfully');
    },
    onError: () => {
      toast.error('Failed to update rank requirements');
    },
  });
  
  useEffect(() => {
    if (ranksData) {
      const requirements: Record<string, any> = {};
      ranksData.forEach((rank: any) => {
        requirements[rank.name] = {
          team_turnover: rank.team_turnover_required,
          first_leg: rank.first_leg_requirement,
          second_leg: rank.second_leg_requirement,
          other_legs: rank.other_legs_requirement
        };
      });
      setRankRequirements(requirements);
    }
  }, [ranksData]);
  
  const handleSaveRankRequirements = () => {
    const updates = Object.entries(rankRequirements).map(([name, req]) => ({
      name,
      team_turnover_required: req.team_turnover,
      first_leg_requirement: req.first_leg,
      second_leg_requirement: req.second_leg,
      other_legs_requirement: req.other_legs
    }));
    updateRanksMutation.mutate({ ranks: updates });
  };
  
  if (ranksLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rank Requirements</CardTitle>
        <CardDescription>Configure turnover requirements for each rank</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ranks.map((rank) => (
          <div key={rank} className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">{rank}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Team Turnover (₦)</Label>
                <Input
                  type="number"
                  value={rankRequirements[rank]?.team_turnover || 0}
                  onChange={(e) => {
                    setRankRequirements({
                      ...rankRequirements,
                      [rank]: {
                        ...rankRequirements[rank],
                        team_turnover: parseFloat(e.target.value) || 0
                      }
                    });
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">1st Leg - 50% Rule (₦)</Label>
                <Input
                  type="number"
                  value={rankRequirements[rank]?.first_leg || 0}
                  onChange={(e) => {
                    setRankRequirements({
                      ...rankRequirements,
                      [rank]: {
                        ...rankRequirements[rank],
                        first_leg: parseFloat(e.target.value) || 0
                      }
                    });
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">2nd Leg - 30% Rule (₦)</Label>
                <Input
                  type="number"
                  value={rankRequirements[rank]?.second_leg || 0}
                  onChange={(e) => {
                    setRankRequirements({
                      ...rankRequirements,
                      [rank]: {
                        ...rankRequirements[rank],
                        second_leg: parseFloat(e.target.value) || 0
                      }
                    });
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Other Legs - 20% Rule (₦)</Label>
                <Input
                  type="number"
                  value={rankRequirements[rank]?.other_legs || 0}
                  onChange={(e) => {
                    setRankRequirements({
                      ...rankRequirements,
                      [rank]: {
                        ...rankRequirements[rank],
                        other_legs: parseFloat(e.target.value) || 0
                      }
                    });
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        ))}
        <Button onClick={handleSaveRankRequirements} disabled={updateRanksMutation.isPending} className="w-full">
          {updateRanksMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Rank Requirements
        </Button>
      </CardContent>
    </Card>
  );
};

export default BonusConfiguration;
