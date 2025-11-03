import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Users, Edit, Loader2, UserCheck, QrCode } from 'lucide-react';
import { Event } from '@/types/admin-events';
import { useEvents, useEventAttendees, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/hooks/useAdminEvents';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { QRCodeScanner } from '@/components/admin/QRCodeScanner';
import { useQueryClient } from '@tanstack/react-query';

const AdminEvents = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [eventSelectorOpen, setEventSelectorOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [scanningEventId, setScanningEventId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'webinar',
    start_date: '',
    end_date: '',
    location: '',
    is_virtual: true,
    meeting_link: '',
    max_attendees: '',
    registration_required: true,
    registration_deadline: '',
    status: 'upcoming',
  });
  const createMutation = useCreateEvent({
    onSuccess: () => {
      setCreateDialogOpen(false);
      resetForm();
    },
  });
  const updateMutation = useUpdateEvent({
    onSuccess: () => {
      setEditDialogOpen(false);
      setEditingEvent(null);
      resetForm();
    },
  });
  const deleteMutation = useDeleteEvent();
  const { data: events, isLoading } = useEvents();
  const { data: attendees = [], isLoading: attendeesLoading } = useEventAttendees(selectedEvent?.id);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'webinar',
      start_date: '',
      end_date: '',
      location: '',
      is_virtual: true,
      meeting_link: '',
      max_attendees: '',
      registration_required: true,
      registration_deadline: '',
      status: 'upcoming',
    });
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      start_date: event.start_date.slice(0, 16),
      end_date: event.end_date ? event.end_date.slice(0, 16) : '',
      location: event.location || '',
      is_virtual: event.is_virtual,
      meeting_link: event.meeting_link || '',
      max_attendees: event.max_attendees?.toString() || '',
      registration_required: true,
      registration_deadline: '',
      status: event.status,
    });
    setEditDialogOpen(true);
  };

  const handleViewAttendees = (event: Event) => {
    setSelectedEvent(event);
    setAttendeesDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      title: formData.title,
      description: formData.description,
      event_type: formData.event_type,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
      location: formData.location || undefined,
      is_virtual: formData.is_virtual,
      meeting_link: formData.meeting_link || undefined,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      registration_required: formData.registration_required,
      registration_deadline: formData.registration_deadline ? new Date(formData.registration_deadline).toISOString() : undefined,
      status: formData.status,
    };
    
    if (editingEvent) {
      updateMutation.mutate({ eventId: editingEvent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Events Management</h2>
          <p className="text-muted-foreground">Manage platform events and webinars</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => setEventSelectorOpen(true)}
            disabled={!events || events.length === 0}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Scan QR Code
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Add a new event or webinar for users</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <RichTextEditor
                  id="description"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  minHeight="150px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="webinar">Webinar</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_attendees">Max Attendees</Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date & Time</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date & Time</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label>Virtual Event</Label>
                <Switch
                  checked={formData.is_virtual}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_virtual: checked })}
                />
              </div>
              {formData.is_virtual ? (
                <div>
                  <Label htmlFor="meeting_link">Meeting Link</Label>
                  <Input
                    id="meeting_link"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="https://zoom.us/..."
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="registration_deadline">Registration Deadline</Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {createMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Attendees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : !events || events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.title}</TableCell>
                      <TableCell className="capitalize">{event.event_type}</TableCell>
                      <TableCell>{new Date(event.start_date).toLocaleString()}</TableCell>
                      <TableCell>
                        {event.is_virtual ? (
                          <Badge variant="outline">Virtual</Badge>
                        ) : (
                          event.location || 'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.current_attendees}
                          {event.max_attendees && `/${event.max_attendees}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.status === 'upcoming' ? 'default' : event.status === 'completed' ? 'secondary' : 'outline'}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setScanningEventId(event.id);
                              setScannerOpen(true);
                            }}
                            title="Scan QR Codes"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewAttendees(event)}
                            title="View Registrations"
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(event.id)}
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
              <p className="text-center">Loading...</p>
            ) : !events || events.length === 0 ? (
              <p className="text-center text-muted-foreground">No events found</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{event.title}</h3>
                    <Badge variant={event.status === 'upcoming' ? 'default' : event.status === 'completed' ? 'secondary' : 'outline'}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground capitalize">{event.event_type}</p>
                    <p>{new Date(event.start_date).toLocaleString()}</p>
                    <div>
                      {event.is_virtual ? (
                        <Badge variant="outline">Virtual</Badge>
                      ) : (
                        <span>{event.location || 'N/A'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {event.current_attendees}
                      {event.max_attendees && `/${event.max_attendees}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setScanningEventId(event.id);
                        setScannerOpen(true);
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Scan
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAttendees(event)}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Attendees
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(event)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => deleteMutation.mutate(event.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          setEditingEvent(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <RichTextEditor
                id="edit-description"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                minHeight="150px"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-event_type">Event Type</Label>
                <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-max_attendees">Max Attendees</Label>
              <Input
                id="edit-max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start_date">Start Date & Time</Label>
                <Input
                  id="edit-start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-end_date">End Date & Time</Label>
                <Input
                  id="edit-end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Virtual Event</Label>
              <Switch
                checked={formData.is_virtual}
                onCheckedChange={(checked) => setFormData({ ...formData, is_virtual: checked })}
              />
            </div>
            {formData.is_virtual ? (
              <div>
                <Label htmlFor="edit-meeting_link">Meeting Link</Label>
                <Input
                  id="edit-meeting_link"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/..."
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {updateMutation.isPending ? 'Updating...' : 'Update Event'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog open={attendeesDialogOpen} onOpenChange={(open) => {
        setAttendeesDialogOpen(open);
        if (!open) setSelectedEvent(null);
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Event Registrations - {selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent?.current_attendees || 0} registered attendees
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {attendeesLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading attendees...</p>
              </div>
            ) : attendees.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No registrations yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendees.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell>{attendee.user?.full_name || 'N/A'}</TableCell>
                      <TableCell>{attendee.user?.email || 'N/A'}</TableCell>
                      <TableCell>{new Date(attendee.registered_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={attendee.attendance_status === 'attended' ? 'default' : 'outline'}>
                          {attendee.attendance_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Selector Dialog */}
      <Dialog open={eventSelectorOpen} onOpenChange={(open) => {
        setEventSelectorOpen(open);
        if (!open) setEventSearchQuery('');
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Event to Scan</DialogTitle>
            <DialogDescription>Choose which event you want to scan QR codes for</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Search events..."
              value={eventSearchQuery}
              onChange={(e) => setEventSearchQuery(e.target.value)}
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {events
                ?.filter(e => e.status === 'upcoming' || e.status === 'ongoing')
                ?.filter(e => e.title.toLowerCase().includes(eventSearchQuery.toLowerCase()))
                .map((event) => (
                <Button
                  key={event.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 text-left"
                  onClick={() => {
                    setScanningEventId(event.id);
                    setEventSelectorOpen(false);
                    setEventSearchQuery('');
                    setScannerOpen(true);
                  }}
                >
                  <div className="w-full min-w-0">
                    <div className="font-semibold truncate">{event.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {new Date(event.start_date).toLocaleDateString()} • {event.current_attendees} attendees
                    </div>
                  </div>
                </Button>
              ))}
              {events?.filter(e => e.status === 'upcoming' || e.status === 'ongoing')?.filter(e => e.title.toLowerCase().includes(eventSearchQuery.toLowerCase())).length === 0 && (
                <p className="text-center text-muted-foreground py-8">No events found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Scanner */}
      {scanningEventId && (
        <QRCodeScanner
          eventId={scanningEventId}
          isOpen={scannerOpen}
          onClose={() => {
            setScannerOpen(false);
            setScanningEventId(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['event-attendees', scanningEventId] });
            queryClient.invalidateQueries({ queryKey: ['admin-events'] });
          }}
        />
      )}
    </div>
  );
};

export default AdminEvents;
