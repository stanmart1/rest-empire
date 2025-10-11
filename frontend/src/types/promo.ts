export interface PromoMaterial {
  id: number;
  title: string;
  description?: string;
  material_type: 'presentation' | 'calculator' | 'brochure' | 'video' | 'image' | 'document';
  file_url: string;
  file_size?: number;
  language: string;
  download_count: number;
  created_at: string;
}

export interface PromoMaterialStats {
  total_materials: number;
  total_downloads: number;
  materials_by_type: Record<string, number>;
}
