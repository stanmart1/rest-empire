import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Event } from '@/types/events';

interface EventRegistrationModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventId: number) => void;
  isSubmitting: boolean;
  defaultData?: {
    full_name: string;
    email: string;
    phone: string;
  };
}

const EventRegistrationModal = ({
  event,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  defaultData,
}: EventRegistrationModalProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (defaultData) {
      setFormData(defaultData);
    }
  }, [defaultData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (event) {
      onSubmit(event.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for Event</DialogTitle>
          <DialogDescription>
            Please confirm your details to register for {event?.title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isSubmitting ? 'Registering...' : 'Confirm Registration'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventRegistrationModal;
