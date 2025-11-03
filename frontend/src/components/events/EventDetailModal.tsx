import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, MapPin, Users, Video, ExternalLink, Loader2, Download, Copy } from 'lucide-react';
import { Event } from '@/types/events';
import { useEventQRCode } from '@/hooks/useEventQRCode';
import { useToast } from '@/hooks/use-toast';
import RichTextDisplay from '@/components/ui/rich-text-display';
import { useAuth } from '@/contexts/AuthContext';

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (event: Event) => void;
  onUnregister?: (eventId: number) => void;
  isRegistering?: boolean;
  isUnregistering?: boolean;
}

const EventDetailModal = ({
  event,
  isOpen,
  onClose,
  onRegister,
  onUnregister,
  isRegistering,
  isUnregistering,
}: EventDetailModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { qrCodeDataUrl, isLoading: qrLoading, downloadQRCode } = useEventQRCode(event, isOpen && event?.is_registered);
  
  if (!event) return null;

  const registrationCode = event.is_registered && user ? `EVT-${event.id}-USR-${user.id}` : null;

  const copyCode = () => {
    if (registrationCode) {
      navigator.clipboard.writeText(registrationCode);
      toast({ title: 'Copied!', description: 'Registration code copied to clipboard' });
    }
  };

  const isExpired = event.end_date 
    ? new Date(event.end_date) < new Date() 
    : new Date(event.start_date) < new Date();

  const getEventTypeColor = (type: string) => {
    const colors = {
      webinar: 'bg-blue-100 text-blue-700',
      training: 'bg-green-100 text-green-700',
      meeting: 'bg-purple-100 text-purple-700',
      conference: 'bg-orange-100 text-orange-700',
      announcement: 'bg-gray-100 text-gray-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700',
      ongoing: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getAttendanceColor = (status: string) => {
    const colors = {
      registered: 'bg-blue-100 text-blue-700',
      attended: 'bg-green-100 text-green-700',
      no_show: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getEventTypeColor(event.event_type)}>
                {event.event_type}
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
              {event.is_registered && event.attendance_status && (
                <Badge className={getAttendanceColor(event.attendance_status)}>
                  {event.attendance_status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl">{event.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {event.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <RichTextDisplay content={event.description} className="text-sm" />
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">Event Details</h3>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(event.start_date)}</p>
              </div>
            </div>

            {event.end_date && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">{formatDate(event.end_date)}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {event.is_virtual ? (
                <>
                  <Video className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Virtual Event</p>
                    {event.meeting_link && event.is_registered && (
                      <a
                        href={event.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Join Meeting <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location || 'TBA'}</p>
                  </div>
                </>
              )}
            </div>

            {event.registration_required && (
              <>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-sm text-muted-foreground">
                      {event.current_attendees}
                      {event.max_attendees && ` / ${event.max_attendees}`} registered
                    </p>
                  </div>
                </div>

                {event.registration_deadline && event.status === 'upcoming' && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-orange-600">Registration Deadline</p>
                      <p className="text-sm text-muted-foreground">{formatDate(event.registration_deadline)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {event.is_registered && (
            <div className="pt-4 border-t space-y-4">
              <div>
                <Label>Registration Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={registrationCode || ''} readOnly className="font-mono" />
                  <Button type="button" variant="outline" size="icon" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Show this code at the event entrance for manual check-in
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Your QR Code</h3>
                <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="flex justify-center p-4 bg-white rounded-lg border">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Event QR Code"
                        className="w-48 h-48"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )}
                  </div>
                  {isExpired && qrCodeDataUrl && (
                    <div className="absolute inset-0 bg-red-500/80 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">QR Code Expired</span>
                    </div>
                  )}
                </div>
                
                {!isExpired && qrCodeDataUrl && (
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadQRCode('png')}
                      disabled={qrLoading}
                    >
                      {qrLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      PNG
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1"
                      onClick={() => downloadQRCode('svg')}
                      disabled={qrLoading}
                    >
                      {qrLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      SVG
                    </Button>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground text-center">
                  {isExpired 
                    ? 'This QR code has expired' 
                    : `Valid until: ${event.end_date ? new Date(event.end_date).toLocaleDateString() : new Date(event.start_date).toLocaleDateString()}`
                  }
                </p>
                </div>
              </div>
            </div>
          )}

          {event.registration_required && (event.status === 'upcoming' || event.status === 'ongoing') && (
            <div className="flex gap-2 pt-4 border-t">
              {event.is_registered ? (
                <Button
                  variant="outline"
                  onClick={() => onUnregister?.(event.id)}
                  disabled={isUnregistering}
                  className="flex-1"
                >
                  {isUnregistering ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Unregister
                </Button>
              ) : event.registration_deadline && new Date(event.registration_deadline) < new Date() ? (
                <Button
                  disabled
                  className="flex-1"
                >
                  Registration Deadline Reached
                </Button>
              ) : (
                <Button
                  onClick={() => onRegister?.(event)}
                  disabled={isRegistering}
                  className="flex-1"
                >
                  {isRegistering ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Register for Event
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailModal;
