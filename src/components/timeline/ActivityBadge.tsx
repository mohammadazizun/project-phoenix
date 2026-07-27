import React from 'react';
import { ActivityType } from '../../services/timelineEngine/types';
import {
  UserPlus,
  Edit3,
  Trash2,
  Upload,
  Download,
  ShoppingBag,
  Receipt,
  CreditCard,
  Boxes,
  Truck,
  Sparkles,
  Activity,
} from 'lucide-react';

interface ActivityBadgeProps {
  activityType: ActivityType | string;
  size?: 'sm' | 'md' | 'lg';
}

export const ActivityBadge: React.FC<ActivityBadgeProps> = ({ activityType, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (activityType) {
      case 'customer_created':
        return {
          icon: UserPlus,
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
        };
      case 'customer_updated':
        return {
          icon: Edit3,
          bg: 'bg-indigo-500/20',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
        };
      case 'customer_deleted':
        return {
          icon: Trash2,
          bg: 'bg-rose-500/20',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
        };
      case 'customer_imported':
        return {
          icon: Upload,
          bg: 'bg-amber-500/20',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
        };
      case 'customer_exported':
        return {
          icon: Download,
          bg: 'bg-cyan-500/20',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
        };
      case 'receivable_created':
        return {
          icon: Receipt,
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
        };
      case 'receivable_updated':
        return {
          icon: Edit3,
          bg: 'bg-indigo-500/20',
          text: 'text-indigo-400',
          border: 'border-indigo-500/30',
        };
      case 'sale_created':
        return {
          icon: ShoppingBag,
          bg: 'bg-violet-500/20',
          text: 'text-violet-400',
          border: 'border-violet-500/30',
        };
      case 'invoice_created':
        return {
          icon: Receipt,
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
        };
      case 'payment_received':
        return {
          icon: CreditCard,
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
        };
      case 'stock_updated':
        return {
          icon: Boxes,
          bg: 'bg-orange-500/20',
          text: 'text-orange-400',
          border: 'border-orange-500/30',
        };
      case 'purchase_created':
        return {
          icon: Truck,
          bg: 'bg-sky-500/20',
          text: 'text-sky-400',
          border: 'border-sky-500/30',
        };
      case 'ai_recommendation':
        return {
          icon: Sparkles,
          bg: 'bg-fuchsia-500/20',
          text: 'text-fuchsia-400',
          border: 'border-fuchsia-500/30',
        };
      default:
        return {
          icon: Activity,
          bg: 'bg-slate-800',
          text: 'text-slate-400',
          border: 'border-slate-700',
        };
    }
  };

  const style = getBadgeStyle();
  const IconComponent = style.icon;

  const dimensionClass =
    size === 'sm' ? 'w-6 h-6 p-1' : size === 'lg' ? 'w-10 h-10 p-2.5' : 'w-8 h-8 p-1.5';
  const iconSizeClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div
      className={`rounded-full flex items-center justify-center border ${style.bg} ${style.text} ${style.border} ${dimensionClass} shrink-0`}
    >
      <IconComponent className={iconSizeClass} />
    </div>
  );
};
