import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  order: number;
}

const AdminContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({ category: '', question: '', answer: '', order: 0 });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await api.get('/faq/');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post('/faq/', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'FAQ created successfully' });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setOpen(false);
      setFormData({ category: '', question: '', answer: '', order: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      await api.put(`/faq/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'FAQ updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
      setOpen(false);
      setEditingFaq(null);
      setFormData({ category: '', question: '', answer: '', order: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/faq/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'FAQ deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });

  const handleSubmit = () => {
    if (editingFaq) {
      updateMutation.mutate({ id: editingFaq.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({ category: faq.category, question: faq.question, answer: faq.answer, order: faq.order });
    setOpen(true);
  };

  const handleAdd = () => {
    setEditingFaq(null);
    setFormData({ category: '', question: '', answer: '', order: 0 });
    setOpen(true);
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
          <Tabs defaultValue="faq">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="home">Home</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="home">
              <p className="text-muted-foreground">Home page content management coming soon...</p>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g., Getting Started"
                        />
                      </div>
                      <div>
                        <Label>Question</Label>
                        <Input
                          value={formData.question}
                          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                          placeholder="Enter question"
                        />
                      </div>
                      <div>
                        <Label>Answer</Label>
                        <Textarea
                          value={formData.answer}
                          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                          placeholder="Enter answer"
                          className="min-h-[150px]"
                        />
                      </div>
                      <div>
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                        {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {editingFaq ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {faqs?.map((faq: FAQ) => (
                  <div key={faq.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">{faq.category}</p>
                        <h3 className="font-semibold">{faq.question}</h3>
                        <p className="text-sm mt-2">{faq.answer}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(faq)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(faq.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about">
              <p className="text-muted-foreground">About page content management coming soon...</p>
            </TabsContent>

            <TabsContent value="contact">
              <p className="text-muted-foreground">Contact page content management coming soon...</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentManagement;
