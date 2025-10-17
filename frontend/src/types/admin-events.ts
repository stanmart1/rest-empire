export interface Event {
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
  status: string;
  current_attendees: number;
}

export interface Attendee {
  id: number;
  user_id: number;
  event_id: number;
  registered_at: string;
  attendance_status: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  is_virtual: boolean;
  meeting_link: string;
  max_attendees: string;
  registration_required: boolean;
  registration_deadline: string;
  status: string;
}
