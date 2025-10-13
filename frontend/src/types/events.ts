export interface Event {
  id: number;
  title: string;
  description?: string;
  event_type: 'webinar' | 'training' | 'announcement' | 'meeting' | 'conference';
  start_date: string;
  end_date?: string;
  location?: string;
  is_virtual: boolean;
  meeting_link?: string;
  max_attendees?: number;
  current_attendees: number;
  is_registered: boolean;
  attendance_status?: 'registered' | 'attended' | 'no_show';
  registration_required: boolean;
  registration_deadline?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface EventStats {
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  total_registrations: number;
}
