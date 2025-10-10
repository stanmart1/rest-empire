import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const Events = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Our Events</h1>
        <p className="text-muted-foreground">Stay updated with our upcoming events and activities</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Events Scheduled</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There are no upcoming events at the moment. Check back later for new announcements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Events;
