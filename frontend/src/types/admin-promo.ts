export interface PromoMaterial {
  id: number;
  title: string;
  description: string;
  material_type: string;
  file_url: string;
  file_size?: number;
  language: string;
  is_active: boolean;
  download_count: number;
  created_at: string;
}

export interface PromoFormData {
  title: string;
  description: string;
  material_type: string;
  file_url: string;
  language: string;
}
