import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Video, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEvents, useMyEvents, useEventStats } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FeatureRestricted from '@/components/common/FeatureRestricted';
import apiService from '@/services/api';
import { Event } from '@/types/events';
import EventDetailModal from '@/components/events/EventDetailModal';
import EventRegistrationModal from '@/components/events/EventRegistrationModal';
import EventQRCodeModal from '@/components/events/EventQRCodeModal';
import { useAuth } from '@/contexts/AuthContext';

const Events = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState<Event | null>(null);
  const [registrationData, setRegistrationData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  const { data: allEvents, isLoading: allEventsLoading, error: eventsError } = useEvents({
    event_type: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const { data: myEvents, isLoading: myEventsLoading } = useMyEvents(true);
  const { data: eventStats, isLoading: statsLoading } = useEventStats();

  if (eventsError && (eventsError as any)?.response?.status === 403) {
    return <FeatureRestricted message={(eventsError as any)?.response?.data?.detail} />;
  }

  const registerMutation = useMutation({
    mutationFn: (eventId: number) => apiService.events.registerForEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      setIsRegisterModalOpen(false);
      setRegistrationData({ full_name: '', email: '', phone: '' });
      
      // Show QR code modal
      setIsQRCodeModalOpen(true);
      
      toast({
        title: "Success",
        description: "Successfully registered for event",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to register for event",
        variant: "destructive",
      });
    },
  });

  const handleRegisterClick = (event: Event) => {
    setRegisteringEvent(event);
    setRegistrationData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone_number || '',
    });
    setIsRegisterModalOpen(true);
  };

  const unregisterMutation = useMutation({
    mutationFn: (eventId: number) => apiService.events.unregisterFromEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      toast({
        title: "Success",
        description: "Successfully unregistered from event",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to unregister from event",
        variant: "destructive",
      });
    },
  });

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAttendanceColor = (status: string) => {
    const colors = {
      registered: 'bg-blue-100 text-blue-700',
      attended: 'bg-green-100 text-green-700',
      no_show: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const renderEventCard = (event: Event) => (
    <Card key={event.id} className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
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
            <CardTitle className="text-lg">{event.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          
          {event.end_date && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Until {formatDate(event.end_date)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {event.is_virtual ? (
              <>
                <Video className="w-4 h-4" />
                <span>Virtual Event</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4" />
                <span>{event.location || 'Location TBA'}</span>
              </>
            )}
          </div>
          
          {event.registration_required && (
            <>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {event.current_attendees}
                  {event.max_attendees && ` / ${event.max_attendees}`} registered
                </span>
              </div>
              {event.registration_deadline && event.status === 'upcoming' && (
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Registration closes: {formatDate(event.registration_deadline)}</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedEvent(event);
              setIsDetailModalOpen(true);
            }}
          >
            View Details
          </Button>
          
          {event.registration_required && (event.status === 'upcoming' || event.status === 'ongoing') && (
            <>
              {event.is_registered ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unregisterMutation.mutate(event.id)}
                  disabled={unregisterMutation.isPending}
                >
                  {unregisterMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Unregister'
                  )}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleRegisterClick(event)}
                  disabled={registerMutation.isPending}
                >
                  Register
                </Button>
              )}
              
              {event.is_virtual && event.meeting_link && event.is_registered && (
                <Button variant="outline" size="sm" asChild>
                  <a href={event.meeting_link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Join
                  </a>
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRegister={handleRegisterClick}
        onUnregister={(eventId) => unregisterMutation.mutate(eventId)}
        isRegistering={registerMutation.isPending}
        isUnregistering={unregisterMutation.isPending}
      />

      <EventRegistrationModal
        event={registeringEvent}
        isOpen={isRegisterModalOpen}
        onClose={() => {
          setIsRegisterModalOpen(false);
          setRegisteringEvent(null);
        }}
        onSubmit={(eventId) => registerMutation.mutate(eventId)}
        isSubmitting={registerMutation.isPending}
        defaultData={registrationData}
      />

      <EventQRCodeModal
        event={registeringEvent}
        isOpen={isQRCodeModalOpen}
        onClose={() => {
          setIsQRCodeModalOpen(false);
          setRegisteringEvent(null);
        }}
      />
      
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Our Events</h1>
        <p className="text-muted-foreground">
          Stay updated with our upcoming events, webinars, and training sessions.
        </p>
      </div>

      {/* Event Stats */}
      {!statsLoading && eventStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{eventStats.total_events}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{eventStats.upcoming_events}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{eventStats.completed_events}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{eventStats.total_registrations}</p>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Grid */}
          {allEventsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents?.map((event: Event) => renderEventCard(event))}
              {!allEvents?.length && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        There are no events matching your filters. Try adjusting your search criteria.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          {myEventsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents?.map((event: Event) => renderEventCard(event))}
              {!myEvents?.length && (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Registered Events</h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        You haven't registered for any upcoming events yet. Check out the available events!
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
};

export default Events;
