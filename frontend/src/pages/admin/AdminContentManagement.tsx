import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2 } from 'lucide-react';

const AdminContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('home');
  const [contents, setContents] = useState<Record<string, string>>({});

  const { isLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: async () => {
      const response = await api.get('/content/');
      const data = response.data.reduce((acc: any, item: any) => {
        acc[item.page] = item.content;
        return acc;
      }, {});
      setContents(data);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ page, content }: { page: string; content: string }) => {
      await api.put(`/content/${page}`, { content });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Content updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update content', variant: 'destructive' });
    },
  });

  const handleSave = (page: string) => {
    updateMutation.mutate({ page, content: contents[page] || '' });
  };

  const handleChange = (page: string, value: string) => {
    setContents({ ...contents, [page]: value });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">Manage website content and pages</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {['home', 'faq', 'about', 'contact'].map((page) => (
              <TabsContent key={page} value={page} className="space-y-4">
                <Textarea
                  value={contents[page] || ''}
                  onChange={(e) => handleChange(page, e.target.value)}
                  placeholder={`Enter ${page} page content...`}
                  className="min-h-[400px] font-mono"
                />
                <Button
                  onClick={() => handleSave(page)}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentManagement;
