'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ServerStatus } from '@/types/mcp';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface ServerStatusBadgeProps {
  status: ServerStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig = {
  online: {
    label: '온라인',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
  },
  offline: {
    label: '오프라인',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  },
  unknown: {
    label: '확인 중',
    icon: HelpCircle,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  },
};

export function ServerStatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true 
}: ServerStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${sizeClasses[size]} font-medium transition-colors duration-200`}
    >
      {showIcon && (
        <Icon className={`${iconSizes[size]} mr-1.5`} />
      )}
      {config.label}
    </Badge>
  );
} 