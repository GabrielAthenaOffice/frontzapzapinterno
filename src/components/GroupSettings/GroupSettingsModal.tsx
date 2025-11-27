import React, { useState, useEffect } from 'react';
import { X, Settings, Plus, Trash2 } from 'lucide-react';
import { groupService, chatService } from '../../services/api';
import { User } from '../../types';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: number; // ID do chat para deletar
  groupId: number;
  groupName: string;
  currentUserId: number;
  isCreator: boolean;
  onGroupUpdated: () => void;
}

const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({
  isOpen,
  onClose,
  chatId,
  groupId,
  groupName,
  currentUserId,
  isCreator,
  onGroupUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'settings'>('info');
  const [groupData, setGroupData] = useState<any>(null);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState(groupName);
  const [newDescription, setNewDescription] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'remove' | 'delete' | null>(null);
  const [confirmUserId, setConfirmUserId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      carregarDadosGrupo();
    }
  }, [isOpen, groupId]);

  const carregarDadosGrupo = async () => {
    try {
      setLoading(true);
      console.log('📋 Carregando dados do grupo:', { groupId, groupName });

      // Carrega usuários disponíveis usando o groupId correto
      const [usuarios, grupoDetalhes] = await Promise.all([
        groupService.listarUsuariosDisponiveis(groupId),
        groupService.buscarGrupo(groupId)
      ]);

      console.log('✅ Usuários disponíveis carregados:', usuarios);
      console.log('✅ Detalhes do grupo carregados:', grupoDetalhes);

      setUsuariosDisponiveis(usuarios);
      setGroupData(grupoDetalhes);

      // Atualiza estados de edição
      setNewName(grupoDetalhes.nome);
      setNewDescription(grupoDetalhes.descricao || '');

      console.log('✅ Dados do grupo carregados com sucesso');
    } catch (err) {
      console.error('Erro ao carregar dados do grupo:', err);
      setError('Erro ao carregar dados do grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarUsuario = async (userId: number) => {
    try {
      setLoading(true);
      await groupService.adicionarUsuario(groupId, userId);
      await carregarDadosGrupo();
      onGroupUpdated();
      setError(null);
    } catch (err) {
      console.error('Erro ao adicionar usuário:', err);
      setError('Erro ao adicionar usuário ao grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverUsuario = async (userId: number) => {
    setConfirmAction('remove');
    setConfirmUserId(userId);
    setShowConfirmDialog(true);
  };

  const handleAtualizarGrupo = async () => {
    try {
      setLoading(true);
      await groupService.atualizarGrupo(groupId, {
        nome: newName,
        descricao: newDescription
      });
      await carregarDadosGrupo();
      onGroupUpdated();
      setError(null);
    } catch (err) {
      console.error('Erro ao atualizar grupo:', err);
      setError('Erro ao atualizar grupo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarGrupo = async () => {
    setConfirmAction('delete');
    setShowConfirmDialog(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center space-x-2">
            <Settings size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Configurações do Grupo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'info'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'members'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Membros
          </button>
          {isCreator && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Configurações
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && !groupData ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Informações Tab */}
              {activeTab === 'info' && groupData && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome do Grupo
                    </label>
                    <p className="text-lg font-bold text-gray-800">{groupData.nome}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição
                    </label>
                    <p className="text-gray-600">
                      {groupData.descricao || 'Sem descrição'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Criado por
                    </label>
                    <p className="text-gray-600">{groupData.criadoPor}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Membros
                    </label>
                    <p className="text-gray-600">
                      {groupData.membros?.length || 0} participantes
                    </p>
                  </div>
                </div>
              )}

              {/* Membros Tab */}
              {activeTab === 'members' && groupData && (
                <div className="space-y-4">
                  {/* Adicionar Usuário */}
                  {isCreator && usuariosDisponiveis.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                        <Plus size={18} />
                        <span>Adicionar Participante</span>
                      </h3>
                      <div className="space-y-2">
                        {usuariosDisponiveis.map((usuario) => (
                          <div
                            key={usuario.id}
                            className="flex items-center justify-between p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">{usuario.nome}</p>
                              <p className="text-xs text-gray-600">{usuario.email}</p>
                            </div>
                            <button
                              onClick={() => handleAdicionarUsuario(usuario.id)}
                              disabled={loading}
                              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de Membros */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Participantes ({groupData.membros?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {groupData.membros?.map((membro: any) => (
                        <div
                          key={membro.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {membro.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{membro.nome}</p>
                              <p className="text-xs text-gray-600">{membro.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {membro.id === currentUserId && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                Você
                              </span>
                            )}
                            {isCreator && membro.id !== currentUserId && (
                              <button
                                onClick={() => handleRemoverUsuario(membro.id)}
                                disabled={loading}
                                className="p-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-200 text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações Tab */}
              {activeTab === 'settings' && isCreator && groupData && (
                <div className="space-y-6">
                  {/* Editar Nome e Descrição */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-4">Editar Informações</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Nome do Grupo
                        </label>
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Nome do grupo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Descrição
                        </label>
                        <textarea
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          placeholder="Descrição do grupo"
                        />
                      </div>

                      <button
                        onClick={handleAtualizarGrupo}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
                      >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </div>

                  {/* Deletar Grupo */}
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-red-800 mb-2">Zona de Perigo</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Deletar este grupo é uma ação permanente e não pode ser desfeita.
                    </p>
                    <button
                      onClick={handleDeletarGrupo}
                      disabled={loading}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 size={18} />
                      <span>{loading ? 'Deletando...' : 'Deletar Grupo'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {confirmAction === 'remove' ? 'Remover Participante' : 'Deletar Grupo'}
            </h3>

            <p className="text-gray-600 mb-6">
              {confirmAction === 'remove'
                ? 'Tem certeza que deseja remover este usuário do grupo?'
                : 'Tem certeza que deseja deletar este grupo? Esta ação não pode ser desfeita e todos os dados serão perdidos.'
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setConfirmAction(null);
                  setConfirmUserId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    if (confirmAction === 'remove' && confirmUserId) {
                      await groupService.removerUsuario(groupId, confirmUserId);
                    } else if (confirmAction === 'delete') {
                      await chatService.deletarChat(chatId);
                      onGroupUpdated();
                      onClose();
                      return;
                    }
                    await carregarDadosGrupo();
                    onGroupUpdated();
                    setError(null);
                  } catch (err: any) {
                    console.error('Erro ao executar ação:', err);
                    setError(confirmAction === 'remove'
                      ? 'Erro ao remover usuário do grupo'
                      : 'Erro ao deletar grupo');
                  } finally {
                    setLoading(false);
                    setShowConfirmDialog(false);
                    setConfirmAction(null);
                    setConfirmUserId(null);
                  }
                }}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-semibold transition-colors ${confirmAction === 'remove'
                  ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-300'
                  : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-300'
                  }`}
              >
                {loading ? 'Processando...' : confirmAction === 'remove' ? 'Remover' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSettingsModal;
