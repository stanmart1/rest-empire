import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Presentation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PromoMaterials = () => {
  const { toast } = useToast();

  const handleDownload = (material: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${material}...`,
    });
    // TODO: Implement actual download functionality
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Promotional Materials</h1>
        <p className="text-muted-foreground">Download promotional content and marketing materials</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Promo pages</CardTitle>
          <p className="text-sm text-muted-foreground">
            You can use any of the presented pages for your work. All users registered on it will immediately fall into your first line and will be able to contact you!
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white">
                <FileText className="w-16 h-16" />
              </div>
              <h3 className="font-semibold mb-2">Rest Empire Calculator</h3>
              <p className="text-sm text-muted-foreground mb-4">Interactive profit calculator</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDownload('Rest Empire Calculator')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-4 flex items-center justify-center text-white">
                <FileText className="w-16 h-16" />
              </div>
              <h3 className="font-semibold mb-2">BOOSTER SPLIT 2.0 Calculator</h3>
              <p className="text-sm text-muted-foreground mb-4">Advanced profit calculator</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDownload('BOOSTER SPLIT 2.0 Calculator')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Presentation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Download our presentation. It's available in many languages.
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg mb-4 flex items-center justify-center text-white">
                <Presentation className="w-16 h-16" />
              </div>
              <h3 className="font-semibold mb-2">Presentation</h3>
              <p className="text-sm text-muted-foreground mb-4">Download our presentation. It's available in many languages.</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDownload('Presentation')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="aspect-video bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg mb-4 flex items-center justify-center text-white">
                <Presentation className="w-16 h-16" />
              </div>
              <h3 className="font-semibold mb-2">Text Description</h3>
              <p className="text-sm text-muted-foreground mb-4">Look through the text option of the presentation! It will make slides clear!</p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleDownload('Text Description')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoMaterials;
