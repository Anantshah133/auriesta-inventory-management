import React from 'react';
import { clsx } from 'clsx';
import type { ProductType } from '../../types';

type BadgeVariant = 'active' | 'inactive' | ProductType;

const variantStyles: Record<string, string> = {
  active: 'badge-active',
  inactive: 'badge-inactive',
  'Silver Plated': 'badge-silver-plated',
  'German Silver': 'badge-german-silver',
  'Gold Plated': 'badge-gold-plated',
  'Brass': 'badge-brass',
  'Stainless Steel': 'badge-stainless-steel',
};

const dotColors: Record<string, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-gray-400',
  'Silver Plated': 'bg-slate-500',
  'German Silver': 'bg-blue-500',
  'Gold Plated': 'bg-amber-500',
  'Brass': 'bg-orange-500',
  'Stainless Steel': 'bg-purple-500',
};

interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  showDot = false,
  className,
}) => {
  return (
    <span className={clsx('badge', variantStyles[variant], className)}>
      {showDot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColors[variant])} />
      )}
      {children || variant}
    </span>
  );
};

// Convenience export for active/inactive status
export const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <Badge variant={isActive ? 'active' : 'inactive'} showDot>
    {isActive ? 'Active' : 'Inactive'}
  </Badge>
);

// Convenience export for product type
export const TypeBadge: React.FC<{ type: ProductType }> = ({ type }) => (
  <Badge variant={type}>{type}</Badge>
);
