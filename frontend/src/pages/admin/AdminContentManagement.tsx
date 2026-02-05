import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import RichTextEditor from '@/components/ui/rich-text-editor';

interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  order: number;
}

interface Blog {
  id: number;
  title: string;
  content: string;
  author: string;
  image_url?: string;
}

const AdminContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({ category: '', question: '', answer: '', order: 0 });
  const [blogFormData, setBlogFormData] = useState({ title: '', content: '', author: '', image_url: '' });
  const [aboutContent, setAboutContent] = useState('');
  const [aboutInitialized, setAboutInitialized] = useState(false);
  const [contactContent, setContactContent] = useState({
    phone: '',
    phone_hours: '',
    email1: '',
    email2: '',
    office_address: '',
    office_city: '',
    business_hours: ''
  });
  const [contactInitialized, setContactInitialized] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [teamFormData, setTeamFormData] = useState({ name: '', position: '', description: '', image_url: '', display_order: 0 });
  const [teamImageFile, setTeamImageFile] = useState<File | null>(null);
  const [teamImagePreview, setTeamImagePreview] = useState<string>('');
  const [uploadingTeamImage, setUploadingTeamImage] = useState(false);
  const [teamStep, setTeamStep] = useState(1);

  // Fetch current logo
  const { data: logoData } = useQuery({
    queryKey: ['site-logo'],
    queryFn: async () => {
      const response = await api.get('/admin/config/config/public/site-logo');
      return response.data;
    },
  });

  // Set logo preview from fetched data
  if (logoData?.logo_url && !logoPreview && logoPreview !== logoData.logo_url) {
    setLogoPreview(logoData.logo_url);
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploadingLogo(true);
    try {
      // Upload file
      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('subfolder', 'logos');

      const uploadResponse = await api.post('/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileUrl = uploadResponse.data.file_url;

      // Save logo URL to config
      await api.post('/admin/config/config', {
        key: 'site_logo',
        value: fileUrl,
        description: 'Site logo URL',
        is_public: true
      });

      toast({
        title: 'Success',
        description: 'Logo uploaded successfully'
      });

      queryClient.invalidateQueries({ queryKey: ['site-logo'] });
      setLogoFile(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to upload logo',
        variant: 'destructive'
      });
    } finally {
      setUploadingLogo(false);
    }
  };
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: ''
  });
  const [socialInitialized, setSocialInitialized] = useState(false);

  const { data: faqs, isLoading } = useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const response = await api.get('/faq/');
      return response.data;
    },
  });

  const { data: blogs } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const response = await api.get('/blog/');
      return response.data;
    },
  });

  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await api.get('/team-members/');
      return response.data;
    },
  });

  const { data: aboutData } = useQuery({
    queryKey: ['about-content'],
    queryFn: async () => {
      const response = await api.get('/about/');
      return response.data;
    },
  });

  if (aboutData && !aboutInitialized) {
    setAboutContent(aboutData.content);
    setAboutInitialized(true);
  }

  const { data: contactData } = useQuery({
    queryKey: ['contact-content'],
    queryFn: async () => {
      const response = await api.get('/contact/');
      return response.data;
    },
  });

  if (contactData && !contactInitialized) {
    try {
      const parsed = JSON.parse(contactData.content);
      setContactContent(parsed);
    } catch {
      setContactContent({
        phone: '',
        phone_hours: '',
        email1: '',
        email2: '',
        office_address: '',
        office_city: '',
        business_hours: ''
      });
    }
    setContactInitialized(true);
  }

  const { data: socialData } = useQuery({
    queryKey: ['social-links'],
    queryFn: async () => {
      const response = await api.get('/social/');
      return response.data;
    },
  });

  if (socialData && !socialInitialized) {
    try {
      const parsed = JSON.parse(socialData.content);
      setSocialLinks(parsed);
    } catch {
      setSocialLinks({
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: ''
      });
    }
    setSocialInitialized(true);
  }

  const updateContactMutation = useMutation({
    mutationFn: async (content: any) => {
      await api.put('/contact/', { content: JSON.stringify(content) });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Contact page updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['contact-content'] });
    },
  });

  const handleContactSave = () => {
    updateContactMutation.mutate(contactContent);
  };

  const updateSocialMutation = useMutation({
    mutationFn: async (content: any) => {
      await api.put('/social/', { content: JSON.stringify(content) });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Social links updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
  });

  const handleSocialSave = () => {
    updateSocialMutation.mutate(socialLinks);
  };

  const updateAboutMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.put('/about/', { content });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'About page updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['about-content'] });
    },
  });

  const handleAboutSave = () => {
    updateAboutMutation.mutate(aboutContent);
  };

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

  const createBlogMutation = useMutation({
    mutationFn: async (data: typeof blogFormData) => {
      await api.post('/blog/', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Blog created successfully' });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setBlogOpen(false);
      setBlogFormData({ title: '', content: '', author: '', image_url: '' });
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof blogFormData }) => {
      await api.put(`/blog/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Blog updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      setBlogOpen(false);
      setEditingBlog(null);
      setBlogFormData({ title: '', content: '', author: '', image_url: '' });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/blog/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Blog deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  const handleBlogSubmit = () => {
    if (editingBlog) {
      updateBlogMutation.mutate({ id: editingBlog.id, data: blogFormData });
    } else {
      createBlogMutation.mutate(blogFormData);
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setBlogFormData({ title: blog.title, content: blog.content, author: blog.author, image_url: blog.image_url || '' });
    setBlogOpen(true);
  };

  const handleAddBlog = () => {
    setEditingBlog(null);
    setBlogFormData({ title: '', content: '', author: '', image_url: '' });
    setBlogOpen(true);
  };

  const createTeamMutation = useMutation({
    mutationFn: async (data: typeof teamFormData) => {
      await api.post('/team-members/', data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Team member created successfully' });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setTeamOpen(false);
      setTeamFormData({ name: '', position: '', description: '', image_url: '', display_order: 0 });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof teamFormData }) => {
      await api.put(`/team-members/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Team member updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setTeamOpen(false);
      setEditingTeam(null);
      setTeamFormData({ name: '', position: '', description: '', image_url: '', display_order: 0 });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/team-members/${id}`);
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Team member deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  const handleTeamSubmit = async () => {
    let imageUrl = teamFormData.image_url;

    if (teamImageFile) {
      setUploadingTeamImage(true);
      try {
        const formData = new FormData();
        formData.append('file', teamImageFile);
        formData.append('subfolder', 'team');

        const uploadResponse = await api.post('/upload/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        imageUrl = uploadResponse.data.file_url;
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.detail || 'Failed to upload image',
          variant: 'destructive'
        });
        setUploadingTeamImage(false);
        return;
      }
      setUploadingTeamImage(false);
    }

    const data = { ...teamFormData, image_url: imageUrl };

    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data });
    } else {
      createTeamMutation.mutate(data);
    }

    setTeamImageFile(null);
    setTeamImagePreview('');
  };

  const handleEditTeam = (member: any) => {
    setEditingTeam(member);
    setTeamFormData({ name: member.name, position: member.position, description: member.description, image_url: member.image_url || '', display_order: member.display_order });
    setTeamImagePreview(member.image_url || '');
    setTeamImageFile(null);
    setTeamOpen(true);
  };

  const handleAddTeam = () => {
    setEditingTeam(null);
    setTeamFormData({ name: '', position: '', description: '', image_url: '', display_order: 0 });
    setTeamImagePreview('');
    setTeamImageFile(null);
    setTeamStep(1);
    setTeamOpen(true);
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
          <Tabs defaultValue="blog">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social Links</TabsTrigger>
            </TabsList>

            <TabsContent value="blog" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={blogOpen} onOpenChange={setBlogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddBlog}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Blog
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>{editingBlog ? 'Edit Blog' : 'Add Blog'}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-1">
                      <div className="space-y-4 py-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={blogFormData.title}
                            onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                            placeholder="Enter blog title"
                          />
                        </div>
                        <div>
                          <Label>Author</Label>
                          <Input
                            value={blogFormData.author}
                            onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                            placeholder="Enter author name"
                          />
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <Input
                            value={blogFormData.image_url || ''}
                            onChange={(e) => setBlogFormData({ ...blogFormData, image_url: e.target.value })}
                            placeholder="Enter image URL"
                          />
                        </div>
                        <div>
                          <Label>Content</Label>
                          <RichTextEditor
                            value={blogFormData.content}
                            onChange={(value) => setBlogFormData({ ...blogFormData, content: value })}
                            placeholder="Enter blog content"
                            minHeight="200px"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button onClick={handleBlogSubmit} disabled={createBlogMutation.isPending || updateBlogMutation.isPending}>
                        {(createBlogMutation.isPending || updateBlogMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {editingBlog ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {blogs?.map((blog: Blog) => (
                  <div key={blog.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{blog.title}</h3>
                        <p className="text-sm text-muted-foreground">By {blog.author}</p>
                        <p className="text-sm mt-2">{blog.content.substring(0, 150)}...</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditBlog(blog)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteBlogMutation.mutate(blog.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                        <RichTextEditor
                          value={formData.answer}
                          onChange={(value) => setFormData({ ...formData, answer: value })}
                          placeholder="Enter answer"
                          minHeight="200px"
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

            <TabsContent value="about" className="space-y-4">
              <RichTextEditor
                value={aboutContent}
                onChange={(value) => setAboutContent(value)}
                placeholder="Enter about page content..."
                minHeight="400px"
              />
              <Button onClick={handleAboutSave} disabled={updateAboutMutation.isPending}>
                {updateAboutMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={contactContent.phone}
                    onChange={(e) => setContactContent({ ...contactContent, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label>Phone Hours</Label>
                  <Input
                    value={contactContent.phone_hours}
                    onChange={(e) => setContactContent({ ...contactContent, phone_hours: e.target.value })}
                    placeholder="Mon-Fri, 9:00 AM - 6:00 PM EST"
                  />
                </div>
                <div>
                  <Label>Email 1</Label>
                  <Input
                    value={contactContent.email1}
                    onChange={(e) => setContactContent({ ...contactContent, email1: e.target.value })}
                    placeholder="support@restempire.com"
                  />
                </div>
                <div>
                  <Label>Email 2</Label>
                  <Input
                    value={contactContent.email2}
                    onChange={(e) => setContactContent({ ...contactContent, email2: e.target.value })}
                    placeholder="partnerships@restempire.com"
                  />
                </div>
                <div>
                  <Label>Office Address</Label>
                  <Input
                    value={contactContent.office_address}
                    onChange={(e) => setContactContent({ ...contactContent, office_address: e.target.value })}
                    placeholder="123 Business Avenue, Suite 100"
                  />
                </div>
                <div>
                  <Label>Office City</Label>
                  <Input
                    value={contactContent.office_city}
                    onChange={(e) => setContactContent({ ...contactContent, office_city: e.target.value })}
                    placeholder="San Francisco, CA 94107"
                  />
                </div>
              </div>
              <div>
                <Label>Business Hours</Label>
                <RichTextEditor
                  value={contactContent.business_hours}
                  onChange={(value) => setContactContent({ ...contactContent, business_hours: value })}
                  placeholder="Monday - Friday: 9:00 AM - 6:00 PM EST&#10;Saturday: 10:00 AM - 4:00 PM EST&#10;Sunday: Closed"
                  minHeight="120px"
                />
              </div>
              <Button onClick={handleContactSave} disabled={updateContactMutation.isPending}>
                {updateContactMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </TabsContent>

            <TabsContent value="logo" className="space-y-4">
              <div className="max-w-2xl">
                <div className="space-y-4">
                  <div>
                    <Label>Current Logo</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                      <img 
                        src={logoPreview || "/favicon.png"} 
                        alt="Logo" 
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="logo-upload">Upload New Logo</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Recommended: Square image (e.g., 512x512px) in PNG format with transparent background. Max size: 2MB
                    </p>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (2MB max)
                          if (file.size > 2 * 1024 * 1024) {
                            toast({
                              title: 'Error',
                              description: 'File size must be less than 2MB',
                              variant: 'destructive'
                            });
                            return;
                          }
                          
                          // Validate dimensions
                          const img = new Image();
                          img.onload = () => {
                            if (img.width > 1024 || img.height > 1024) {
                              toast({
                                title: 'Warning',
                                description: 'Image dimensions are large. Recommended: 512x512px or smaller',
                              });
                            }
                            setLogoFile(file);
                            setLogoPreview(URL.createObjectURL(file));
                          };
                          img.src = URL.createObjectURL(file);
                        }
                      }}
                    />
                  </div>

                  {logoPreview && logoPreview !== "/favicon.png" && (
                    <div>
                      <Label>Preview</Label>
                      <div className="mt-2 p-4 border rounded-lg bg-background">
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleLogoUpload} 
                      disabled={!logoFile || uploadingLogo}
                    >
                      {uploadingLogo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Upload Logo
                    </Button>
                    {logoPreview && logoPreview !== "/favicon.png" && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview('');
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddTeam}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>{editingTeam ? 'Edit Team Member' : 'Add Team Member'} - Step {teamStep} of 2</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto px-1">
                      {teamStep === 1 ? (
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Name *</Label>
                            <Input
                              value={teamFormData.name}
                              onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                              placeholder="Enter name"
                            />
                          </div>
                          <div>
                            <Label>Position *</Label>
                            <Input
                              value={teamFormData.position}
                              onChange={(e) => setTeamFormData({ ...teamFormData, position: e.target.value })}
                              placeholder="Enter position"
                            />
                          </div>
                          <div>
                            <Label>Display Order</Label>
                            <Input
                              type="number"
                              value={teamFormData.display_order}
                              onChange={(e) => setTeamFormData({ ...teamFormData, display_order: parseInt(e.target.value) || 0 })}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Description *</Label>
                            <RichTextEditor
                              value={teamFormData.description}
                              onChange={(value) => setTeamFormData({ ...teamFormData, description: value })}
                              placeholder="Enter description"
                              minHeight="200px"
                            />
                          </div>
                          <div>
                            <Label>Team Member Image (Optional)</Label>
                            <p className="text-sm text-muted-foreground mb-2">
                              Upload an image or enter a URL. Recommended: Square image (e.g., 400x400px). Max size: 2MB
                            </p>
                            <Input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast({
                                      title: 'Error',
                                      description: 'File size must be less than 2MB',
                                      variant: 'destructive'
                                    });
                                    return;
                                  }
                                  setTeamImageFile(file);
                                  setTeamImagePreview(URL.createObjectURL(file));
                                  setTeamFormData({ ...teamFormData, image_url: '' });
                                }
                              }}
                            />
                            {teamImagePreview && (
                              <div className="mt-2">
                                <img src={teamImagePreview} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                              </div>
                            )}
                            <div className="mt-2">
                              <Label>Or enter image URL</Label>
                              <Input
                                value={teamFormData.image_url || ''}
                                onChange={(e) => {
                                  setTeamFormData({ ...teamFormData, image_url: e.target.value });
                                  setTeamImageFile(null);
                                  setTeamImagePreview(e.target.value);
                                }}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between gap-2 pt-4 border-t">
                      {teamStep === 2 && (
                        <Button variant="outline" onClick={() => setTeamStep(1)}>
                          Back
                        </Button>
                      )}
                      {teamStep === 1 ? (
                        <Button 
                          onClick={() => setTeamStep(2)} 
                          disabled={!teamFormData.name || !teamFormData.position}
                          className="ml-auto"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleTeamSubmit} 
                          disabled={createTeamMutation.isPending || updateTeamMutation.isPending || uploadingTeamImage || !teamFormData.description}
                          className="ml-auto"
                        >
                          {(createTeamMutation.isPending || updateTeamMutation.isPending || uploadingTeamImage) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          {editingTeam ? 'Update' : 'Create'}
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {teamMembers?.map((member: any) => (
                  <div key={member.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-4 flex-1">
                        {member.image_url && (
                          <img src={member.image_url} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          <p className="text-sm text-primary font-medium">{member.position}</p>
                          <div className="text-sm mt-2 text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: member.description }} />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditTeam(member)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTeamMutation.mutate(member.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Facebook URL</Label>
                  <Input
                    value={socialLinks.facebook}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input
                    value={socialLinks.instagram}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    placeholder="https://instagram.com/yourpage"
                  />
                </div>
                <div>
                  <Label>Twitter URL</Label>
                  <Input
                    value={socialLinks.twitter}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourpage"
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={socialLinks.linkedin}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/yourpage"
                  />
                </div>
              </div>
              <Button onClick={handleSocialSave} disabled={updateSocialMutation.isPending}>
                {updateSocialMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentManagement;
