import React from 'react';
import { ReceivableStatus } from '../../services/receivablesEngine/types';
import { AlertCircle, CheckCircle2, Clock, FileEdit, XCircle } from 'lucide-react';

interface ReceivableStatusBadgeProps {
  status: ReceivableStatus;
  isOverdue?: boolean;
}

export const ReceivableStatusBadge: React.FC<ReceivableStatusBadgeProps> = ({
  status,
  isOverdue = false,
}) => {
  const getStatusConfig = () => {
    if (isOverdue && (status === 'open' || status === 'partially_paid')) {
      return {
        label: 'Overdue',
        icon: AlertCircle,
        bg: 'bg-rose-500/20',
        text: 'text-rose-400',
        border: 'border-rose-500/40',
      };
    }

    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          icon: FileEdit,
          bg: 'bg-slate-800',
          text: 'text-slate-400',
          border: 'border-slate-700',
        };
      case 'open':
        return {
          label: 'Open',
          icon: Clock,
          bg: 'bg-amber-500/20',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
        };
      case 'partially_paid':
        return {
          label: 'Partial',
          icon: Clock,
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
        };
      case 'paid':
        return {
          label: 'Paid',
          icon: CheckCircle2,
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          bg: 'bg-rose-950/40',
          text: 'text-slate-500',
          border: 'border-slate-800',
        };
      default:
        return {
          label: status,
          icon: Clock,
          bg: 'bg-slate-800',
          text: 'text-slate-300',
          border: 'border-slate-700',
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border} shrink-0`}
    >
      <IconComponent className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
