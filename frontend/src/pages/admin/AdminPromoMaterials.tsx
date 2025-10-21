import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, Pencil, Loader2 } from 'lucide-react';
import { PromoMaterial } from '@/types/admin-promo';
import { usePromoMaterials, useCreatePromoMaterial, useUpdatePromoMaterial, useDeletePromoMaterial } from '@/hooks/useAdminPromo';
import api from '@/lib/api';

const AdminPromoMaterials = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<PromoMaterial | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<PromoMaterial | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    material_type: 'document',
    file_url: '',
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const createMutation = useCreatePromoMaterial({
    onSuccess: () => {
      setCreateDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        material_type: 'document',
        file_url: '',
      });
      setUploadFile(null);
    },
  });
  const updateMutation = useUpdatePromoMaterial({
    onSuccess: () => {
      setEditDialogOpen(false);
      setEditingMaterial(null);
    },
  });
  const deleteMutation = useDeletePromoMaterial({
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setMaterialToDelete(null);
    },
  });
  const { data: materials, isLoading } = usePromoMaterials();

  const handleDeleteClick = (material: PromoMaterial) => {
    setMaterialToDelete(material);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (materialToDelete) {
      deleteMutation.mutate(materialToDelete.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      return;
    }
    
    try {
      // Upload file first
      const uploadFormData = new FormData();
      uploadFormData.append('file', uploadFile);
      
      const uploadResponse = await api.post('/upload/', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Create material with uploaded file URL
      createMutation.mutate({
        ...formData,
        file_url: uploadResponse.data.file_url,
      });
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const handleEditClick = (material: PromoMaterial) => {
    setEditingMaterial(material);
    setFormData({
      title: material.title,
      description: material.description,
      material_type: material.material_type,
      file_url: material.file_url,
    });
    setUploadFile(null);
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;
    
    let fileUrl = formData.file_url;
    
    // Upload new file if provided
    if (uploadFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append('file', uploadFile);
        
        const uploadResponse = await api.post('/upload/', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        fileUrl = uploadResponse.data.file_url;
      } catch (error) {
        console.error('File upload failed:', error);
        return;
      }
    }
    
    updateMutation.mutate({ 
      materialId: editingMaterial.id, 
      data: { ...formData, file_url: fileUrl } 
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Promotional Materials</h2>
          <p className="text-muted-foreground">Manage marketing and promotional content</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Promotional Material</DialogTitle>
              <DialogDescription>Upload new marketing content for users</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="material_type">Material Type</Label>
                <Select value={formData.material_type} onValueChange={(value) => setFormData({ ...formData, material_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="brochure">Brochure</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="file_upload">Upload File</Label>
                <div className="mt-2">
                  <label htmlFor="file_upload" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                    Choose File
                  </label>
                  <input
                    id="file_upload"
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    required
                  />
                  {uploadFile && <p className="text-sm text-muted-foreground mt-2">{uploadFile.name}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Adding...' : 'Add Material'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Materials</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : !materials || materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No materials found
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell className="capitalize">{material.material_type}</TableCell>
                      <TableCell className="uppercase">{material.language}</TableCell>
                      <TableCell>{formatFileSize(material.file_size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {material.download_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(material)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(material)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : !materials || materials.length === 0 ? (
              <p className="text-center text-muted-foreground">No materials found</p>
            ) : (
              materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h3 className="font-medium">{material.title}</h3>
                    <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                      <span className="capitalize">{material.material_type}</span>
                      <span>•</span>
                      <span className="uppercase">{material.language}</span>
                      <span>•</span>
                      <span>{formatFileSize(material.file_size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Download className="h-4 w-4" />
                    {material.download_count} downloads
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditClick(material)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDeleteClick(material)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Promotional Material</DialogTitle>
            <DialogDescription>Update marketing content details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-material_type">Material Type</Label>
              <Select value={formData.material_type} onValueChange={(value) => setFormData({ ...formData, material_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="brochure">Brochure</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-file_upload">Upload New File (Optional)</Label>
              <div className="mt-2">
                <label htmlFor="edit-file_upload" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
                  Choose File
                </label>
                <input
                  id="edit-file_upload"
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {uploadFile && <p className="text-sm text-muted-foreground mt-2">{uploadFile.name}</p>}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Material'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{materialToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPromoMaterials;
