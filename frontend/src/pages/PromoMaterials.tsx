import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Presentation, Video, Image, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePromoMaterials } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '@/services/api';
import { PromoMaterial } from '@/types/promo';
import FeatureRestricted from '@/components/common/FeatureRestricted';

const PromoMaterials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  const { data: materials, isLoading: materialsLoading, error: materialsError } = usePromoMaterials({
    material_type: typeFilter !== 'all' ? typeFilter : undefined,
    language: languageFilter !== 'all' ? languageFilter : undefined,
  });

  if (materialsError && (materialsError as any)?.response?.status === 403) {
    return <FeatureRestricted message={(materialsError as any)?.response?.data?.detail} />;
  }

  const downloadMutation = useMutation({
    mutationFn: (materialId: number) => apiService.promoMaterials.downloadMaterial(materialId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['promo-materials'] });
      queryClient.invalidateQueries({ queryKey: ['promo-stats'] });
      
      // Open download URL
      if (data.download_url) {
        window.open(data.download_url, '_blank');
      }
      
      toast({
        title: "Download Started",
        description: "Your download has been initiated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Download Failed",
        description: error.response?.data?.detail || "Failed to download material",
        variant: "destructive",
      });
    },
  });

  const getTypeIcon = (type: string) => {
    const icons = {
      presentation: Presentation,
      calculator: FileText,
      document: File,
      video: Video,
      image: Image,
      brochure: FileText,
    };
    const IconComponent = icons[type as keyof typeof icons] || File;
    return <IconComponent className="w-16 h-16" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      presentation: 'from-blue-500 to-blue-600',
      calculator: 'from-green-500 to-green-600',
      document: 'from-gray-500 to-gray-600',
      video: 'from-red-500 to-red-600',
      image: 'from-purple-500 to-purple-600',
      brochure: 'from-orange-500 to-orange-600',
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const renderMaterialCard = (material: PromoMaterial) => (
    <Card key={material.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className={`aspect-video bg-gradient-to-br ${getTypeColor(material.material_type)} rounded-lg mb-4 flex items-center justify-center text-white`}>
          {getTypeIcon(material.material_type)}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {material.material_type}
            </Badge>
            <Badge variant="outline">
              {material.file_size ? formatFileSize(material.file_size) : 'Size unknown'}
            </Badge>
          </div>
          
          <h3 className="font-semibold">{material.title}</h3>
          
          {material.description && (
            <p className="text-sm text-muted-foreground">{material.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{material.download_count} downloads</span>
            <span>{material.language.toUpperCase()}</span>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => downloadMutation.mutate(material.id)}
          disabled={downloadMutation.isPending}
        >
          {downloadMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Promotional Materials</h1>
        <p className="text-muted-foreground">
          Download promotional content and marketing materials to grow your business
        </p>
      </div>



      {/* Filters */}
      <div className="flex gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Material Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="presentation">Presentation</SelectItem>
            <SelectItem value="calculator">Calculator</SelectItem>
            <SelectItem value="brochure">Brochure</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="document">Document</SelectItem>
          </SelectContent>
        </Select>

        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
            <SelectItem value="de">German</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials Grid */}
      {materialsLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials?.map((material: PromoMaterial) => renderMaterialCard(material))}
          {!materials?.length && (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Materials Found</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    No promotional materials match your current filters. Try adjusting your search criteria.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromoMaterials;
