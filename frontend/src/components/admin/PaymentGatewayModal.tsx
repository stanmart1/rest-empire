import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Gateway {
  id: string;
  name: string;
  fields: Array<{ key: string; label: string; type: string }>;
}

interface PaymentGatewayModalProps {
  open: boolean;
  onClose: () => void;
  gateway: Gateway | null;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function PaymentGatewayModal({
  open,
  onClose,
  gateway,
  values,
  onChange,
  onSave,
  isSaving,
}: PaymentGatewayModalProps) {
  if (!gateway) return null;

  const fields = Array.isArray(gateway.config_fields) ? gateway.config_fields : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{gateway.name} Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <Label>{field.label}</Label>
              <Input
                type={field.type}
                value={values[field.key] || ''}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="mt-2"
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
