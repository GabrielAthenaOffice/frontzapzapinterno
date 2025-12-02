// src/types/permissions.ts

/**
 * Enum que define todas as roles (funções) disponíveis no sistema.
 * Hierarquia: ADMIN > LIDER_DE_SETOR > FUNCIONARIO > ESTAGIARIO
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    LIDER_DE_SETOR = 'LIDER_DE_SETOR',
    FUNCIONARIO = 'FUNCIONARIO',
    ESTAGIARIO = 'ESTAGIARIO'
}

/**
 * Enum que define todas as permissões granulares do sistema.
 * Cada permissão representa uma ação específica que pode ser controlada.
 */
export enum Permission {
    // Permissões de Usuário
    USER_CREATE = 'USER_CREATE',
    USER_READ = 'USER_READ',
    USER_UPDATE = 'USER_UPDATE',
    USER_DELETE = 'USER_DELETE',

    // Permissões de Grupo
    GROUP_CREATE = 'GROUP_CREATE',
    GROUP_READ = 'GROUP_READ',
    GROUP_UPDATE = 'GROUP_UPDATE',
    GROUP_DELETE = 'GROUP_DELETE',
    GROUP_MANAGE_MEMBERS = 'GROUP_MANAGE_MEMBERS',

    // Permissões de Mensagem
    MESSAGE_READ = 'MESSAGE_READ',
    MESSAGE_SEND = 'MESSAGE_SEND',
    MESSAGE_DELETE = 'MESSAGE_DELETE',

    // Permissões de Gerenciamento
    ROLE_MANAGE = 'ROLE_MANAGE'
}

/**
 * Mapeamento de roles para suas permissões.
 * Implementa a mesma lógica do backend.
 */
export const rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
        // ADMIN tem todas as permissões
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.GROUP_CREATE,
        Permission.GROUP_READ,
        Permission.GROUP_UPDATE,
        Permission.GROUP_DELETE,
        Permission.GROUP_MANAGE_MEMBERS,
        Permission.MESSAGE_READ,
        Permission.MESSAGE_SEND,
        Permission.MESSAGE_DELETE,
        Permission.ROLE_MANAGE
    ],

    [UserRole.LIDER_DE_SETOR]: [
        // LIDER_DE_SETOR tem permissões amplas, mas não pode deletar usuários ou gerenciar roles
        Permission.USER_CREATE,
        Permission.USER_READ,
        Permission.USER_UPDATE,
        Permission.GROUP_CREATE,
        Permission.GROUP_READ,
        Permission.GROUP_UPDATE,
        Permission.GROUP_DELETE,
        Permission.GROUP_MANAGE_MEMBERS,
        Permission.MESSAGE_READ,
        Permission.MESSAGE_SEND,
        Permission.MESSAGE_DELETE
    ],

    [UserRole.FUNCIONARIO]: [
        // FUNCIONARIO tem permissões operacionais básicas
        Permission.USER_READ,
        Permission.GROUP_CREATE,
        Permission.GROUP_READ,
        Permission.MESSAGE_READ,
        Permission.MESSAGE_SEND
    ],

    [UserRole.ESTAGIARIO]: [
        // ESTAGIARIO tem permissões mais restritas
        Permission.USER_READ,
        Permission.GROUP_READ,
        Permission.MESSAGE_READ,
        Permission.MESSAGE_SEND
    ]
};

/**
 * Labels amigáveis para exibição das roles
 */
export const roleLabelMap: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.LIDER_DE_SETOR]: 'Líder de Setor',
    [UserRole.FUNCIONARIO]: 'Funcionário',
    [UserRole.ESTAGIARIO]: 'Estagiário'
};

/**
 * Cores para badges de roles
 */
export const roleColorMap: Record<UserRole, { bg: string; text: string; border: string }> = {
    [UserRole.ADMIN]: {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-300',
        border: 'border-red-300 dark:border-red-700'
    },
    [UserRole.LIDER_DE_SETOR]: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-300 dark:border-blue-700'
    },
    [UserRole.FUNCIONARIO]: {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-300',
        border: 'border-green-300 dark:border-green-700'
    },
    [UserRole.ESTAGIARIO]: {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-300',
        border: 'border-gray-300 dark:border-gray-600'
    }
};
