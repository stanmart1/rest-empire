import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Video, ExternalLink, Loader2 } from 'lucide-react';
import { Event } from '@/types/events';

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (eventId: number) => void;
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
  if (!event) return null;

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
              <p className="text-muted-foreground">{event.description}</p>
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

          {event.registration_required && event.status === 'upcoming' && (
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
              ) : (
                <Button
                  onClick={() => onRegister?.(event.id)}
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
