import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const AdminSettings = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: async () => {
      const response = await api.get('/admin/config/settings/platform');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Platform Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Platform Name</Label>
            <Input value={settings?.platform_name || 'Rest Empire'} className="mt-2" />
          </div>
          <div>
            <Label>Support Email</Label>
            <Input value={settings?.support_email || ''} className="mt-2" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
