import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureRestrictedProps {
  message?: string;
}

const FeatureRestricted = ({ message }: FeatureRestrictedProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-center">
            <Lock className="w-5 h-5" />
            Feature Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {message || 'You need to activate your account to access this feature.'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => navigate('/activation')}
              className="flex-1"
            >
              Proceed to Activate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureRestricted;
