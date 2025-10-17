import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import apiService from '@/services/api';

interface BankTransferModalProps {
  open: boolean;
  onClose: () => void;
  paymentData: any;
  onSuccess: () => void;
}

const BankTransferModal = ({ open, onClose, paymentData, onSuccess }: BankTransferModalProps) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const bankDetails = paymentData?.payment_data;
  const transactionId = paymentData?.transaction_id;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Copied to clipboard",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !transactionId) return;

    setUploading(true);
    try {
      await apiService.payment.uploadProof(transactionId, file);
      setUploaded(true);
      toast({
        title: "Success",
        description: "Payment proof uploaded successfully",
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to upload proof",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Simulate loading when modal opens
  useState(() => {
    if (open && paymentData) {
      setLoading(true);
      setTimeout(() => setLoading(false), 500);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Bank Transfer Payment</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading payment details...</span>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Bank Name</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{bankDetails?.bank_name}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(bankDetails?.bank_name)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-lg">{bankDetails?.account_number}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(bankDetails?.account_number)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Account Name</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{bankDetails?.account_name}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(bankDetails?.account_name)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{bankDetails?.transaction_reference}</p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => copyToClipboard(bankDetails?.transaction_reference)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-2">Instructions:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              {bankDetails?.instructions?.map((instruction: string, index: number) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Upload Payment Proof</Label>
            <Input
              id="proof"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              disabled={uploading || uploaded}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading || uploaded}
              className="flex-1"
            >
              {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {uploaded && <CheckCircle className="w-4 h-4 mr-2" />}
              {uploaded ? 'Uploaded' : 'Upload Proof'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BankTransferModal;
