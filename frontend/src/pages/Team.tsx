import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, QrCode, Mail, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import RankBadge from '@/components/common/RankBadge';
import StatusBadge from '@/components/common/StatusBadge';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  rank: string;
  status: string;
  registeredAt: string;
  turnover: number;
  teamSize: number;
  children?: TeamMember[];
}

interface SponsorInfo {
  name: string;
  email: string;
  status: string;
}

interface TeamStats {
  firstLine: number;
  allTeam: number;
}

const Team = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [teamList, setTeamList] = useState<TeamMember[]>([]);
  const [teamTree, setTeamTree] = useState<TeamMember[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [rankFilter, setRankFilter] = useState('all');
  
  const referralLink = "https://restempire.com/partner/znrp59sa";
  
  const sponsorInfo: SponsorInfo = {
    name: "Kikelomo Ayodele",
    email: "kike4gold@gmail.com",
    status: "Sponsor"
  };

  const teamStats: TeamStats = {
    firstLine: 0,
    allTeam: 0
  };

  useEffect(() => {
    const fetchTeamData = async () => {
      setIsLoading(true);
      try {
        const [listRes, treeRes] = await Promise.all([
          api.get('/team/list'),
          api.get('/team/tree')
        ]);
        const listData = Array.isArray(listRes.data)
          ? listRes.data
          : Array.isArray((listRes as any).data?.data)
            ? (listRes as any).data.data
            : [];
        const treeData = Array.isArray(treeRes.data)
          ? treeRes.data
          : Array.isArray((treeRes as any).data?.data)
            ? (treeRes as any).data.data
            : [];
        setTeamList(listData);
        setTeamTree(treeData);
      } catch (error) {
        console.error('Failed to fetch team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (member: TeamMember, level: number = 0) => {
    const hasChildren = member.children && member.children.length > 0;
    const isExpanded = expandedNodes.has(member.id);

    return (
      <div key={member.id} className="mb-2">
        <div
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleNode(member.id)}
              className="flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <Avatar className="w-8 h-8">
            <AvatarFallback>
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
          </div>
          
          <RankBadge rank={member.rank} size="sm" />
          <span className={`text-xs px-2 py-1 rounded-full ${
            member.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
          }`}>
            {member.status}
          </span>
          <p className="text-sm font-medium">{member.turnover.toLocaleString()} EUR</p>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {member.children!.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredTeamList = (Array.isArray(teamList) ? teamList : []).filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Referral Link Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-muted-foreground">Referral link</span>
              <span className="text-sm font-medium">{referralLink}</span>
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

      {/* Sponsor and Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Sponsor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My sponsor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>
                  {sponsorInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{sponsorInfo.name}</p>
                <p className="text-xs text-muted-foreground">{sponsorInfo.status}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm text-white">kike4gold@gmail.com</span>
              <Button 
                size="icon" 
                variant="ghost" 
                className="ml-auto h-6 w-6"
                onClick={() => {
                  navigator.clipboard.writeText(sponsorInfo.email);
                  toast({
                    title: "Copied!",
                    description: "Email copied to clipboard",
                  });
                }}
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Team Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">My Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback>PA</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Peter Adelodun</p>
                <p className="text-xs text-muted-foreground">Not verified</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">First Line</span>
                <span className="text-2xl font-bold">{teamStats.firstLine}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">All Team</span>
                <span className="text-2xl font-bold">{teamStats.allTeam}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Tabs */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="search">Search My Team</TabsTrigger>
          <TabsTrigger value="tree">Performance Tree</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Filter</h3>
                <Button 
                  variant="link" 
                  className="text-sm"
                  onClick={() => {
                    toast({
                      title: "Advanced Filters",
                      description: "Advanced filtering options coming soon",
                    });
                  }}
                >
                  Advanced
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Input
                    placeholder="Search name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Registered: Newest on Top</SelectItem>
                      <SelectItem value="oldest">Registered: Oldest on Top</SelectItem>
                      <SelectItem value="turnover">Highest Turnover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={rankFilter} onValueChange={setRankFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Rank" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="amber">Amber</SelectItem>
                      <SelectItem value="jade">Jade</SelectItem>
                      <SelectItem value="ruby">Ruby</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button className="w-full md:w-auto mt-4">Filter</Button>
            </CardContent>
          </Card>

          {/* Empty State or Results */}
          {filteredTeamList.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-32 h-32 mb-4 opacity-50">
                  <Search className="w-full h-full text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Empty</h3>
                <p className="text-muted-foreground">You don't have a tree</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4">
                {/* Team list would go here */}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tree" className="space-y-4">
          <Card>
            <CardHeader>
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </CardHeader>
            <CardContent>
              {!(Array.isArray(teamTree) && teamTree.length > 0) ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-32 h-32 mb-4 opacity-50">
                    <Search className="w-full h-full text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Empty</h3>
                  <p className="text-muted-foreground">You don't have a tree</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(Array.isArray(teamTree) ? teamTree : []).map(member => renderTreeNode(member))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Team;
