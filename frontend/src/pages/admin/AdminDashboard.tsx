import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, UserCheck, Clock, TrendingUp, Gift, CreditCard, BookOpen } from 'lucide-react';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();

  const { data: userAnalytics } = useQuery({
    queryKey: ['adminUserAnalytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/users?period=30d');
      return response.data;
    },
  });

  const { data: financialAnalytics } = useQuery({
    queryKey: ['adminFinancialAnalytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/financial?period=30d');
      return response.data;
    },
  });

  const { data: transactionStats } = useQuery({
    queryKey: ['adminTransactionStats'],
    queryFn: async () => {
      const response = await api.get('/admin/transactions/stats');
      return response.data;
    },
  });

  // Process user growth data
  const userGrowthData = userAnalytics?.user_growth?.slice(-6).map((item: any) => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    users: item.count
  })) || [];

  // Process revenue data
  const revenueData = financialAnalytics?.revenue_trend?.slice(-6).map((item: any) => ({
    month: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
    ngn: item.amount || 0,
    usdt: 0
  })) || [];

  // Process rank distribution
  const rankColors: Record<string, string> = {
    'Bronze': '#cd7f32',
    'Silver': '#c0c0c0',
    'Gold': '#ffd700',
    'Platinum': '#e5e4e2',
    'Diamond': '#b9f2ff'
  };
  const rankDistribution = userAnalytics?.rank_distribution?.map((item: any) => ({
    name: item.rank,
    value: item.count,
    color: rankColors[item.rank] || '#8884d8'
  })) || [];

  // Process transaction data
  const transactionData = transactionStats?.by_type || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Users with active packages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">NGN Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{isLoading ? '...' : (stats?.total_revenue_ngn || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.pending_verifications || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payouts</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.pending_payouts || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bonuses</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{isLoading ? '...' : (stats?.total_bonuses_paid || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Bonuses paid out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">USDT Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${isLoading ? '...' : (stats?.total_revenue_usdt || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time USDT</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats?.total_books || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Books in library</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ngn" fill="#10b981" name="NGN" />
                <Bar dataKey="usdt" fill="#3b82f6" name="USDT" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rank Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Rank Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rankDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rankDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transaction Types */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="type" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
