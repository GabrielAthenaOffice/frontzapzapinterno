// src/utils/permissionUtils.ts
import { User } from '../types';
import { UserRole, Permission, rolePermissions } from '../types/permissions';

/**
 * Verifica se um usuário tem uma permissão específica
 */
export const hasPermission = (user: User | null, permission: Permission): boolean => {
    if (!user || !user.role) return false;

    const permissions = rolePermissions[user.role];
    return permissions.includes(permission);
};

/**
 * Verifica se um usuário tem pelo menos uma das permissões fornecidas
 */
export const hasAnyPermission = (user: User | null, permissions: Permission[]): boolean => {
    if (!user || !user.role) return false;

    return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Verifica se um usuário tem todas as permissões fornecidas
 */
export const hasAllPermissions = (user: User | null, permissions: Permission[]): boolean => {
    if (!user || !user.role) return false;

    return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Verifica se um usuário tem uma role específica
 */
export const hasRole = (user: User | null, role: UserRole): boolean => {
    if (!user || !user.role) return false;
    return user.role === role;
};

/**
 * Verifica se um usuário tem pelo menos uma das roles fornecidas
 */
export const hasAnyRole = (user: User | null, roles: UserRole[]): boolean => {
    if (!user || !user.role) return false;
    return roles.includes(user.role);
};

/**
 * Verifica se um usuário é ADMIN
 */
export const isAdmin = (user: User | null): boolean => {
    return hasRole(user, UserRole.ADMIN);
};

/**
 * Verifica se um usuário é LIDER_DE_SETOR
 */
export const isLiderDeSetor = (user: User | null): boolean => {
    return hasRole(user, UserRole.LIDER_DE_SETOR);
};

/**
 * Verifica se um usuário é FUNCIONARIO
 */
export const isFuncionario = (user: User | null): boolean => {
    return hasRole(user, UserRole.FUNCIONARIO);
};

/**
 * Verifica se um usuário é ESTAGIARIO
 */
export const isEstagiario = (user: User | null): boolean => {
    return hasRole(user, UserRole.ESTAGIARIO);
};

/**
 * Verifica se um usuário pode gerenciar um grupo específico
 * Regra: Apenas o criador do grupo ou ADMIN podem gerenciar
 */
export const canManageGroup = (user: User | null, groupCreatorId: number): boolean => {
    if (!user) return false;

    // ADMIN sempre pode gerenciar
    if (isAdmin(user)) return true;

    // Criador do grupo pode gerenciar
    return user.id === groupCreatorId;
};

/**
 * Verifica se um usuário pode criar grupos
 */
export const canCreateGroup = (user: User | null): boolean => {
    return hasPermission(user, Permission.GROUP_CREATE);
};

/**
 * Verifica se um usuário pode registrar novos usuários
 */
export const canRegisterUsers = (user: User | null): boolean => {
    return hasPermission(user, Permission.USER_CREATE);
};

/**
 * Verifica se um usuário pode deletar mensagens
 */
export const canDeleteMessages = (user: User | null): boolean => {
    return hasPermission(user, Permission.MESSAGE_DELETE);
};

/**
 * Verifica se um usuário pode deletar outros usuários
 */
export const canDeleteUsers = (user: User | null): boolean => {
    return hasPermission(user, Permission.USER_DELETE);
};

/**
 * Verifica se um usuário pode atualizar dados de outro usuário
 * Regra: Pode atualizar seus próprios dados ou ADMIN pode atualizar qualquer um
 */
export const canUpdateUser = (user: User | null, targetUserId: number): boolean => {
    if (!user) return false;

    // Pode atualizar seus próprios dados
    if (user.id === targetUserId) return true;

    // ADMIN pode atualizar qualquer usuário
    return isAdmin(user);
};

/**
 * Retorna o label amigável da role do usuário
 */
export const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
        [UserRole.ADMIN]: 'Administrador',
        [UserRole.LIDER_DE_SETOR]: 'Líder de Setor',
        [UserRole.FUNCIONARIO]: 'Funcionário',
        [UserRole.ESTAGIARIO]: 'Estagiário'
    };

    return labels[role] || role;
};

/**
 * Retorna todas as permissões de uma role
 */
export const getPermissionsForRole = (role: UserRole): Permission[] => {
    return rolePermissions[role] || [];
};
