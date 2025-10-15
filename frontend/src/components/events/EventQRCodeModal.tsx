import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { Event } from '@/types/events';
import { useEventQRCode } from '@/hooks/useEventQRCode';

interface EventQRCodeModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventQRCodeModal = ({ event, isOpen, onClose }: EventQRCodeModalProps) => {
  const { qrCodeDataUrl, isLoading, downloadQRCode } = useEventQRCode(event, isOpen);

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Event Registration QR Code</DialogTitle>
          <DialogDescription>
            Your unique QR code for {event.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center p-4 bg-white rounded-lg border">
            {qrCodeDataUrl ? (
              <img 
                src={qrCodeDataUrl} 
                alt="Event QR Code"
                className="w-64 h-64"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground text-center">
            <p>Show this QR code at the event entrance</p>
            <p className="text-xs mt-1">
              Valid until: {event.end_date ? new Date(event.end_date).toLocaleDateString() : new Date(event.start_date).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => downloadQRCode('png')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download PNG
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => downloadQRCode('svg')}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventQRCodeModal;
