import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Camera, CameraOff } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QRCodeScanner = ({ eventId, isOpen, onClose, onSuccess }: QRCodeScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; userName?: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      setTimeout(() => {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }, 100);
    }
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await handleScan(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (error) {
      toast({ title: 'Camera access denied', variant: 'destructive' });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop();
        setScanning(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  const handleScan = async (qrData: string) => {
    try {
      await stopScanning();
      
      const data = JSON.parse(qrData);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/events/${eventId}/scan-attendance`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Attendance marked successfully',
          userName: result.user_name,
        });
        onSuccess();
        setTimeout(() => {
          setResult(null);
          startScanning();
        }, 2000);
      } else {
        setResult({ success: false, message: result.detail || 'Invalid QR code' });
        setTimeout(() => {
          setResult(null);
          startScanning();
        }, 2000);
      }
    } catch (error) {
      setResult({ success: false, message: 'Failed to scan QR code' });
      setTimeout(() => {
        setResult(null);
        startScanning();
      }, 2000);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Attendee QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isOpen && <div id="qr-reader" className="w-full rounded-lg overflow-hidden" />}

          {!scanning ? (
            <Button onClick={startScanning} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="w-full">
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Camera
            </Button>
          )}

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.userName && <div className="font-semibold">{result.userName}</div>}
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
