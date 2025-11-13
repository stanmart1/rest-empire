import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Loader2, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const publicApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date?: string;
  location?: string;
  is_virtual: boolean;
  meeting_link?: string;
  max_attendees?: number;
  current_attendees: number;
  is_paid: boolean;
  price_ngn?: number;
  price_usdt?: number;
  allowed_payment_methods?: string;
  public_link: string;
}

const PublicEvents = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    payment_method: '',
    currency: 'NGN',
    payment_proof: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: events, isLoading } = useQuery({
    queryKey: ['public-events'],
    queryFn: async () => {
      const response = await publicApi.get('/events/', {
        params: { 
          upcoming_only: true,
          public_only: true
        }
      });
      return response.data;
    },
  });

  const handleRegister = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
    setFormData({
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      payment_method: '',
      currency: 'NGN',
      payment_proof: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    try {
      await publicApi.post(`/events/public/${selectedEvent.public_link}/register`, {
        guest_name: formData.guest_name,
        guest_email: formData.guest_email,
        guest_phone: formData.guest_phone,
        ...(selectedEvent.is_paid && {
          payment_method: formData.payment_method,
          currency: formData.currency,
          payment_proof: formData.payment_proof
        })
      });

      toast({
        title: 'Registration Successful!',
        description: selectedEvent.is_paid 
          ? 'Your registration is pending payment approval.'
          : 'You have successfully registered for this event.',
      });
      setDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Registration Failed',
        description: error.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allowedMethods = selectedEvent?.allowed_payment_methods 
    ? JSON.parse(selectedEvent.allowed_payment_methods) 
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="relative overflow-hidden bg-gradient-to-br from-primary from-0% via-purple-900 via-75% to-secondary to-100%">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-yellow-400/30 to-transparent rounded-full blur-3xl" />
        <div className="container mx-auto px-4 py-28 md:py-36 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Public Events
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
              Join our upcoming events and webinars. No account required!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No public events available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event: Event) => (
              <Card key={event.id} className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="capitalize text-xs font-semibold">
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                    {event.is_paid && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col pt-0">
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">
                          {new Date(event.start_date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(event.start_date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium">
                        {event.is_virtual ? (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Virtual Event
                          </span>
                        ) : (
                          event.location || 'TBA'
                        )}
                      </span>
                    </div>
                    
                    {event.max_attendees && (
                      <div className="flex items-center gap-3 text-sm">
                        <Users className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{event.current_attendees}/{event.max_attendees} registered</span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((event.current_attendees / event.max_attendees) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all"
                              style={{ width: `${(event.current_attendees / event.max_attendees) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {event.is_paid && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-bold text-green-700 dark:text-green-300">
                            ₦{event.price_ngn?.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            or ${event.price_usdt} USDT
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleRegister(event)}
                    className="w-full font-semibold"
                    size="lg"
                    disabled={event.max_attendees ? event.current_attendees >= event.max_attendees : false}
                  >
                    {event.max_attendees && event.current_attendees >= event.max_attendees 
                      ? 'Event Full' 
                      : event.is_paid ? 'Register & Pay' : 'Register Free'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Register for {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="guest_name">Full Name *</Label>
              <Input
                id="guest_name"
                required
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="guest_email">Email *</Label>
              <Input
                id="guest_email"
                type="email"
                required
                value={formData.guest_email}
                onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="guest_phone">Phone</Label>
              <Input
                id="guest_phone"
                value={formData.guest_phone}
                onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
              />
            </div>

            {selectedEvent?.is_paid && (
              <>
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦{selectedEvent.price_ngn?.toLocaleString()})</SelectItem>
                      <SelectItem value="USDT">USDT (${selectedEvent.price_usdt})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_method">Payment Method *</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedMethods.map((method: string) => (
                        <SelectItem key={method} value={method}>
                          {method.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_proof">Payment Proof URL (optional)</Label>
                  <Input
                    id="payment_proof"
                    placeholder="https://..."
                    value={formData.payment_proof}
                    onChange={(e) => setFormData({ ...formData, payment_proof: e.target.value })}
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default PublicEvents;
