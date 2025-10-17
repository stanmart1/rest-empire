import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Loader2, Package, Eye, CheckCircle, XCircle } from 'lucide-react';
import { ActivationPackage, ActivationPayment, PackageFormData } from '@/types/admin-activation';
import { formatCurrency } from '@/utils/formatters';
import {
  useActivationPackages,
  useActivationPayments,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  useApprovePayment,
  useRejectPayment
} from '@/hooks/useAdminActivation';

const AdminActivationPackages = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ActivationPackage | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<ActivationPackage | null>(null);
  const [paymentDetailsOpen, setPaymentDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ActivationPayment | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    price: '',
    duration_days: '',
    features: '',
    is_active: true,
  });

  const { data: packages, isLoading } = useActivationPackages();
  const { data: payments, isLoading: paymentsLoading } = useActivationPayments();
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();
  const approveMutation = useApprovePayment();
  const rejectMutation = useRejectPayment();

  const handleViewPayment = (payment: ActivationPayment) => {
    setSelectedPayment(payment);
    setPaymentDetailsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const features = formData.features.split('\n').map(f => f.trim()).filter(f => f.length > 0);
    const data = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
      features,
      is_active: formData.is_active,
    };

    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, data }, {
        onSuccess: () => {
          setIsEditOpen(false);
          setEditingPackage(null);
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setIsCreateOpen(false);
          setFormData({
            name: '',
            description: '',
            price: '',
            duration_days: '',
            features: '',
            is_active: true,
          });
        }
      });
    }
  };

  const handleEdit = (pkg: ActivationPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price.toString(),
      duration_days: '',
      features: pkg.features.join('\n'),
      is_active: pkg.is_active,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (pkg: ActivationPackage) => {
    setDeletingPackage(pkg);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPackage) {
      deleteMutation.mutate(deletingPackage.id, {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setDeletingPackage(null);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Activation Management</h1>
      </div>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="payments">Activation Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Create Package</Button>
              </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Activation Package</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Starter Package"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Package description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_days">Duration (Days)</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="features">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Package
              </Button>
            </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading packages...</p>
            </div>
          ) : !packages || packages.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">No Packages Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Create your first activation package to get started.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(pkg.price, 'NGN')}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {pkg.features.slice(0, 2).map((feature, idx) => (
                          <div key={idx}>• {feature}</div>
                        ))}
                        {pkg.features.length > 2 && (
                          <div className="text-muted-foreground">+{pkg.features.length - 2} more</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={pkg.is_active ? 'default' : 'secondary'}>
                        {pkg.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pkg)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payments">
        <Card>
          <CardHeader>
            <CardTitle>Activation Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading payments...</p>
              </div>
            ) : !payments || payments.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                No activation payments yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.user_name}</p>
                          <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.package_name}</TableCell>
                      <TableCell>
                        {formatCurrency(payment.amount, 'NGN')}
                      </TableCell>
                      <TableCell className="capitalize">{payment.payment_method?.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Badge variant={payment.status === 'completed' ? 'default' : payment.status === 'failed' ? 'destructive' : 'secondary'}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleViewPayment(payment)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Activation Package</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Package Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Price (₦)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-duration_days">Duration (Days)</Label>
                <Input
                  id="edit-duration_days"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-features">Features (one per line)</Label>
              <Textarea
                id="edit-features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update Package
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete <strong>{deletingPackage?.name}</strong>?</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDetailsOpen} onOpenChange={setPaymentDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">User</Label>
                  <p className="font-medium">{selectedPayment.user_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.user_email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={selectedPayment.status === 'completed' ? 'default' : selectedPayment.status === 'failed' ? 'destructive' : 'secondary'}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Package</Label>
                  <p className="font-medium">{selectedPayment.package_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-medium">{formatCurrency(selectedPayment.amount, 'NGN')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="font-medium capitalize">{selectedPayment.payment_method?.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transaction ID</Label>
                  <p className="font-medium">#{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="font-medium">{new Date(selectedPayment.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedPayment.payment_method === 'bank_transfer' && selectedPayment.meta_data?.proof_uploaded && (
                <div>
                  <Label className="text-muted-foreground">Payment Proof</Label>
                  <div className="mt-2 p-4 border rounded-lg">
                    <p className="text-sm">File: {selectedPayment.meta_data.proof_filename}</p>
                    <p className="text-xs text-muted-foreground mt-1">Proof uploaded by user</p>
                  </div>
                </div>
              )}

              {selectedPayment.payment_reference && (
                <div>
                  <Label className="text-muted-foreground">Payment Reference</Label>
                  <p className="font-medium">{selectedPayment.payment_reference}</p>
                </div>
              )}

              {selectedPayment.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => approveMutation.mutate(selectedPayment.id, {
                      onSuccess: () => setPaymentDetailsOpen(false)
                    })}
                    disabled={approveMutation.isPending}
                    className="flex-1"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve & Activate
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate(selectedPayment.id, {
                      onSuccess: () => setPaymentDetailsOpen(false)
                    })}
                    disabled={rejectMutation.isPending}
                    className="flex-1"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminActivationPackages;
