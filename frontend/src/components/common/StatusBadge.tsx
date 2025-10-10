import { cn } from '@/lib/utils';
import { Clock, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'failed' | 'processing' | 'cancelled' | 'approved' | 'rejected' | 'open' | 'closed' | 'in_progress' | 'resolved';
  size?: 'sm' | 'md';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    pending: { label: 'Pending', color: 'text-warning-foreground', bgColor: 'bg-warning', icon: Clock },
    completed: { label: 'Completed', color: 'text-success-foreground', bgColor: 'bg-success', icon: CheckCircle },
    failed: { label: 'Failed', color: 'text-destructive-foreground', bgColor: 'bg-destructive', icon: XCircle },
    processing: { label: 'Processing', color: 'text-info-foreground', bgColor: 'bg-info', icon: Loader },
    cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: XCircle },
    approved: { label: 'Approved', color: 'text-success-foreground', bgColor: 'bg-success', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'text-destructive-foreground', bgColor: 'bg-destructive', icon: XCircle },
    open: { label: 'Open', color: 'text-info-foreground', bgColor: 'bg-info', icon: AlertCircle },
    closed: { label: 'Closed', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: CheckCircle },
    in_progress: { label: 'In Progress', color: 'text-warning-foreground', bgColor: 'bg-warning', icon: Loader },
    resolved: { label: 'Resolved', color: 'text-success-foreground', bgColor: 'bg-success', icon: CheckCircle },
  };

  const config = statusConfig[status] || statusConfig['pending'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium',
      config.bgColor,
      config.color,
      sizeClasses[size]
    )}>
      <Icon className={cn(iconSizes[size], status === 'processing' && 'animate-spin')} />
      <span>{config.label}</span>
    </div>
  );
};

export default StatusBadge;
