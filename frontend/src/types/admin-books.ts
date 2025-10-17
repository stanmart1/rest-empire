export interface Book {
  id: number;
  title: string;
  author: string;
  cover_image?: string;
  description?: string;
  created_at: string;
}

export interface BookReview {
  id: number;
  book_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  cover_image: File | null;
}
