// src/components/common/ProtectedAction.tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Permission, UserRole } from '../../types/permissions';
import { hasPermission, hasRole, hasAnyRole } from '../../utils/permissionUtils';

interface ProtectedActionProps {
    /** Permissão necessária para exibir o conteúdo */
    permission?: Permission;
    /** Role necessária para exibir o conteúdo */
    role?: UserRole;
    /** Múltiplas roles aceitas (OR logic) */
    roles?: UserRole[];
    /** Conteúdo a ser exibido quando o usuário NÃO tem permissão */
    fallback?: React.ReactNode;
    /** Conteúdo a ser exibido quando o usuário TEM permissão */
    children: React.ReactNode;
    /** Se true, desabilita o elemento ao invés de ocultá-lo */
    disableInsteadOfHide?: boolean;
    /** Tooltip a ser exibido quando desabilitado */
    disabledTooltip?: string;
}

/**
 * Componente para renderização condicional baseada em permissões ou roles.
 * 
 * Exemplos de uso:
 * 
 * ```tsx
 * // Por permissão
 * <ProtectedAction permission={Permission.GROUP_CREATE}>
 *   <button>Criar Grupo</button>
 * </ProtectedAction>
 * 
 * // Por role única
 * <ProtectedAction role={UserRole.ADMIN}>
 *   <button>Painel Admin</button>
 * </ProtectedAction>
 * 
 * // Por múltiplas roles
 * <ProtectedAction roles={[UserRole.ADMIN, UserRole.LIDER_DE_SETOR]}>
 *   <button>Registrar Usuário</button>
 * </ProtectedAction>
 * 
 * // Com fallback
 * <ProtectedAction permission={Permission.GROUP_CREATE} fallback={<p>Sem permissão</p>}>
 *   <button>Criar Grupo</button>
 * </ProtectedAction>
 * 
 * // Desabilitar ao invés de ocultar
 * <ProtectedAction 
 *   permission={Permission.GROUP_CREATE} 
 *   disableInsteadOfHide 
 *   disabledTooltip="Você não tem permissão para criar grupos"
 * >
 *   <button>Criar Grupo</button>
 * </ProtectedAction>
 * ```
 */
const ProtectedAction: React.FC<ProtectedActionProps> = ({
    permission,
    role,
    roles,
    fallback = null,
    children,
    disableInsteadOfHide = false,
    disabledTooltip
}) => {
    const { user } = useAuth();

    // Verificar permissão
    let hasAccess = true;

    if (permission) {
        hasAccess = hasPermission(user, permission);
    } else if (role) {
        hasAccess = hasRole(user, role);
    } else if (roles && roles.length > 0) {
        hasAccess = hasAnyRole(user, roles);
    }

    // Se não tem acesso
    if (!hasAccess) {
        if (disableInsteadOfHide) {
            // Desabilitar o elemento
            return (
                <div title={disabledTooltip} className="inline-block">
                    {React.Children.map(children, child => {
                        if (React.isValidElement(child)) {
                            return React.cloneElement(child as React.ReactElement<any>, {
                                disabled: true,
                                className: `${(child.props as any).className || ''} opacity-50 cursor-not-allowed`,
                                onClick: (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }
                            });
                        }
                        return child;
                    })}
                </div>
            );
        }

        // Ocultar e mostrar fallback
        return <>{fallback}</>;
    }

    // Tem acesso, renderizar normalmente
    return <>{children}</>;
};

export default ProtectedAction;
