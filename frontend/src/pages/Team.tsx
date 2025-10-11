import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, QrCode, ChevronDown, ChevronRight, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RankBadge from '@/components/common/RankBadge';
import StatusBadge from '@/components/common/StatusBadge';
import { useTeamTree, useFirstLine, useTeamStats, useLegBreakdown, useSearchMembers } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { TeamMemberInfo } from '@/types/team';

const Team = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const [rankFilter, setRankFilter] = useState('all');
  
  const { data: teamTree, isLoading: treeLoading } = useTeamTree({ depth: 5 });
  const { data: firstLine, isLoading: firstLineLoading } = useFirstLine();
  const { data: teamStats, isLoading: statsLoading } = useTeamStats();
  const { data: legBreakdown, isLoading: legLoading } = useLegBreakdown();
  const { data: searchResults, isLoading: searchLoading } = useSearchMembers({
    search: searchQuery || undefined,
    rank: rankFilter !== 'all' ? rankFilter : undefined,
  });
  
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

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTeamMember = (member: TeamMemberInfo, depth = 0) => (
    <div key={member.id} className={`border-l-2 border-gray-200 ${depth > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
        <button
          onClick={() => toggleNode(member.id)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {expandedNodes.has(member.id) ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        <Avatar className="w-10 h-10">
          <AvatarFallback>
            {member.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{member.full_name || 'Unknown'}</span>
            <RankBadge rank={member.current_rank} size="sm" />
            <StatusBadge status={member.is_active ? 'active' : 'inactive'} />
          </div>
          <div className="text-sm text-muted-foreground">
            {member.email} • Team: {member.team_size} • €{member.personal_turnover.toFixed(0)}
          </div>
        </div>
        
        <div className="text-right text-sm">
          <div className="text-muted-foreground">
            {new Date(member.registration_date).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderListMember = (member: TeamMemberInfo) => (
    <div key={member.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg border-b">
      <Avatar className="w-10 h-10">
        <AvatarFallback>
          {member.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">{member.full_name || 'Unknown'}</span>
          <RankBadge rank={member.current_rank} size="sm" />
          <StatusBadge status={member.is_active ? 'active' : 'inactive'} />
        </div>
        <div className="text-sm text-muted-foreground">
          {member.email} • Team: {member.team_size} • €{member.personal_turnover.toFixed(0)}
        </div>
      </div>
      
      <div className="text-right text-sm text-muted-foreground">
        {new Date(member.registration_date).toLocaleDateString()}
      </div>
    </div>
  );

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Team</h1>
        <p className="text-muted-foreground">
          Manage and view your team structure, performance, and growth.
        </p>
      </div>

      {/* Team Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{teamStats?.first_line_count || 0}</p>
              <p className="text-sm text-muted-foreground">First Line</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{teamStats?.total_team_size || 0}</p>
              <p className="text-sm text-muted-foreground">Total Team</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{teamStats?.active_members || 0}</p>
              <p className="text-sm text-muted-foreground">Active Members</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">€{teamStats?.total_team_turnover?.toFixed(0) || '0'}</p>
              <p className="text-sm text-muted-foreground">Team Turnover</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Referral Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="flex-1" />
            <Button onClick={copyReferralLink} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Tabs */}
      <Tabs defaultValue="tree" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tree">Team Tree</TabsTrigger>
          <TabsTrigger value="list">Team List</TabsTrigger>
          <TabsTrigger value="legs">Leg Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Structure</CardTitle>
            </CardHeader>
            <CardContent>
              {treeLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {teamTree?.map((member: TeamMemberInfo) => renderTeamMember(member))}
                  {!teamTree?.length && (
                    <p className="text-center text-muted-foreground py-8">
                      No team members found. Start building your team!
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Team Members</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={rankFilter} onValueChange={setRankFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranks</SelectItem>
                      <SelectItem value="Pearl">Pearl</SelectItem>
                      <SelectItem value="Sapphire">Sapphire</SelectItem>
                      <SelectItem value="Ruby">Ruby</SelectItem>
                      <SelectItem value="Emerald">Emerald</SelectItem>
                      <SelectItem value="Diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="turnover">Turnover</SelectItem>
                      <SelectItem value="team_size">Team Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {searchLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {(searchQuery || rankFilter !== 'all' ? searchResults : firstLine)?.map((member: TeamMemberInfo) => 
                    renderListMember(member)
                  )}
                  {!(searchQuery || rankFilter !== 'all' ? searchResults : firstLine)?.length && (
                    <p className="text-center text-muted-foreground py-8">
                      No team members found.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leg Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {legLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : legBreakdown ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">First Leg (50%)</h4>
                      <p className="text-lg font-bold">€{legBreakdown.first_leg?.turnover?.toFixed(0) || '0'}</p>
                      <p className="text-sm text-muted-foreground">{legBreakdown.first_leg?.team_size || 0} members</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Second Leg (30%)</h4>
                      <p className="text-lg font-bold">€{legBreakdown.second_leg?.turnover?.toFixed(0) || '0'}</p>
                      <p className="text-sm text-muted-foreground">{legBreakdown.second_leg?.team_size || 0} members</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Other Legs</h4>
                      <p className="text-lg font-bold">€{legBreakdown.other_legs_combined?.turnover?.toFixed(0) || '0'}</p>
                      <p className="text-sm text-muted-foreground">{legBreakdown.other_legs_combined?.team_size || 0} members</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No leg data available yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Team;
