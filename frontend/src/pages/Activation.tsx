import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const Activation = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Activation</h1>
        <p className="text-muted-foreground">Manage your account activation status</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Account Activation</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Your account activation details will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Activation;
