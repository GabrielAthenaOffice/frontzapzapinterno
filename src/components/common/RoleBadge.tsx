// src/components/common/RoleBadge.tsx
import React from 'react';
import { UserRole, roleLabelMap, roleColorMap } from '../../types/permissions';

interface RoleBadgeProps {
    role: UserRole;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm', showIcon = false }) => {
    const colors = roleColorMap[role];
    const label = roleLabelMap[role];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5'
    };

    const iconMap: Record<UserRole, string> = {
        [UserRole.ADMIN]: '👑',
        [UserRole.LIDER_DE_SETOR]: '⭐',
        [UserRole.FUNCIONARIO]: '👤',
        [UserRole.ESTAGIARIO]: '🎓'
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1 rounded-full border font-medium
        ${colors.bg} ${colors.text} ${colors.border}
        ${sizeClasses[size]}
      `}
        >
            {showIcon && <span>{iconMap[role]}</span>}
            {label}
        </span>
    );
};

export default RoleBadge;
