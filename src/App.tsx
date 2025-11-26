// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, LogOut, Menu, Plus, X } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { chatService, mensagemService, userService } from './services/api';
import websocketService from './services/websocket';
import { Chat, Mensagem, User, ChatListItem } from './types';
import { formatMessageTime } from './utils/dateFormartter';
import LoginForm from './components/Auth/LoginForm';

const ChatCorporativoContent = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [chatAtivo, setChatAtivo] = useState<Chat | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNovoChat, setShowNovoChat] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState('');
  const [usuariosSelecionados, setUsuariosSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsConnectedRef = useRef(false);
  const carregandoDadosRef = useRef(false); // 🔑 Evitar múltiplas requisições

  // Monitorar mudanças no usuário (apenas para debug)
  useEffect(() => {
    if (user) {
      console.log('✅ Usuário autenticado. ID:', user.id, 'Nome:', user.nome);
    } else if (!authLoading) {
      console.log('❌ Não autenticado, mostrando login');
    }
  }, [user, authLoading]);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Conectar WebSocket quando usuário logado
  useEffect(() => {
    if (user && !wsConnectedRef.current && chats.length > 0) {
      console.log('🔌 Tentando conectar WebSocket...');
      conectarWebSocket();
    }

    return () => {
      if (wsConnectedRef.current) {
        console.log('🔌 Desconectando WebSocket...');
        websocketService.disconnect();
        wsConnectedRef.current = false;
      }
    };
  }, [user, chats.length]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user && !carregandoDadosRef.current) {
      carregandoDadosRef.current = true;
      carregarDadosIniciais();
    }
  }, [user]);

  // Inscrever no chat ativo
  useEffect(() => {
    if (chatAtivo && wsConnectedRef.current) {
      console.log('📡 Inscrevendo no chat:', chatAtivo.id);
      websocketService.subscribeToChat(chatAtivo.id, (novaMensagem) => {
        setMensagens(prev => {
          // Evitar duplicatas
          if (prev.some(m => m.id === novaMensagem.id)) {
            return prev;
          }
          return [...prev, novaMensagem];
        });

        // Atualizar última mensagem na lista
        setChats(prev => prev.map(chat => 
          chat.id === chatAtivo.id
            ? { 
                ...chat, 
                ultimaMensagem: novaMensagem.conteudo,
                ultimoConteudo: novaMensagem.conteudo,
                horaUltimaMensagem: formatMessageTime(novaMensagem.enviadoEm),
                ultimaMensagemEm: novaMensagem.enviadoEm
              }
            : chat
        ));
      });
    }

    return () => {
      if (chatAtivo) {
        console.log('📡 Desinscrevendo do chat:', chatAtivo.id);
        websocketService.unsubscribeFromChat(chatAtivo.id);
      }
    };
  }, [chatAtivo, wsConnectedRef.current]);

  const conectarWebSocket = async () => {
    try {
      console.log('🔌 Conectando WebSocket...');
      await websocketService.connect();
      wsConnectedRef.current = true;
      console.log('✅ WebSocket conectado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error);
      setError('Erro ao conectar com o servidor de mensagens');
    }
  };

  const carregarDadosIniciais = async () => {
    try {
      console.log('📊 Iniciando carregamento de dados iniciais...');
      setLoading(true);
      
      // Carregar apenas os chats do usuário autenticado e todos os usuários
      const [chatsData, usuariosData] = await Promise.all([
        chatService.listarMeusChats(),
        userService.listarUsuarios()
      ]);

      console.log('✅ Dados carregados com sucesso');
      console.log('📝 Total de chats:', chatsData.length);
      console.log('👥 Total de usuários:', usuariosData.length);

      // Transformar chats para ChatListItem com informações do ChatResumoDTO
      const chatsComInfo: ChatListItem[] = chatsData.map(chat => ({
        ...chat,
        ultimaMensagem: chat.ultimoConteudo || 'Clique para ver mensagens',
        horaUltimaMensagem: chat.ultimaMensagemEm 
          ? formatMessageTime(chat.ultimaMensagemEm)
          : 'Agora'
      }));

      setChats(chatsComInfo);
      setUsuarios(usuariosData);
      setLoading(false);
      console.log('✅ Estado atualizado');
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      setLoading(false);
      
      // Se for erro 403/401, a sessão expirou
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('⚠️ Sessão expirada! Fazendo logout...');
        await logout();
        setError('Sua sessão expirou. Por favor, faça login novamente.');
        return;
      }
      
      setError('Erro ao carregar dados iniciais');
    }
  };

  const selecionarChat = async (chat: Chat) => {
    setChatAtivo(chat);
    setLoading(true);
    
    try {
      const mensagensData = await mensagemService.listarMensagens(chat.id);
      setMensagens(mensagensData);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      setError('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const enviarMensagem = () => {
    if (!novaMensagem.trim() || !chatAtivo || !user) return;

    const mensagemDTO = {
      chatId: chatAtivo.id,
      remetenteId: user.id,
      remetenteNome: user.nome,
      conteudo: novaMensagem
    };

    // Enviar via WebSocket
    if (wsConnectedRef.current) {
      websocketService.sendMessage(chatAtivo.id, mensagemDTO);
      setNovaMensagem('');
      // ✅ NÃO adicionar otimisticamente - deixar o servidor retornar
      // A mensagem chegará via subscription ao tópico
    } else {
      setError('WebSocket desconectado. Tentando reconectar...');
      conectarWebSocket();
    }
  };

  const criarNovoChat = async () => {
    if (usuariosSelecionados.length === 0) {
      setError('Selecione pelo menos um usuário');
      return;
    }

    setLoading(true);
    try {
      let novoChat: Chat;
      
      if (usuariosSelecionados.length === 1) {
        // Chat privado com um usuário
        novoChat = await chatService.criarChatPrivado(usuariosSelecionados[0]);
      } else {
        // Criar grupo com múltiplos usuários
        // O backend adiciona automaticamente o criador (usuário autenticado)
        const nomesUsuarios = usuariosSelecionados
          .map(id => usuarios.find(u => u.id === id)?.nome || 'Usuário')
          .join(', ');
        
        // Se houver outros usuários além dos selecionados, incluir o criador no nome
        const nomeGrupo = user 
          ? `${user.nome}, ${nomesUsuarios}`
          : nomesUsuarios;
        
        // Os usuariosIds devem conter os IDs dos usuários selecionados
        // O backend adiciona o criador automaticamente
        novoChat = await chatService.criarGrupoChat(nomeGrupo, usuariosSelecionados);
      }

      setChats(prev => [
        {
          ...novoChat,
          ultimaMensagem: 'Nova conversa',
          horaUltimaMensagem: 'Agora',
          ultimoConteudo: 'Nova conversa',
          ultimaMensagemEm: new Date().toISOString(),
          quantidadeNaoLidas: 0
        },
        ...prev
      ]);
      
      setShowNovoChat(false);
      setUsuariosSelecionados([]);
      setSearchUsuario('');
      setChatAtivo(novoChat);
    } catch (error: any) {
      console.error('Erro ao criar chat:', error);
      setError(error.response?.data?.message || 'Erro ao criar chat');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      websocketService.disconnect();
      wsConnectedRef.current = false;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.id !== user?.id && 
    u.nome.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  // Mostrar tela de login se não autenticado
  if (authLoading) {
    console.log('⏳ Autenticação carregando...');
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ Sem usuário, mostrando LoginForm');
    return <LoginForm />;
  }

  console.log('✅ Usuário autenticado, mostrando chat');
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-4">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-4 bg-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Conversas</h2>
            <button
              onClick={() => setShowNovoChat(true)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-semibold">
              {user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold truncate">{user.nome}</p>
              <p className="text-xs text-blue-200 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto">
          {loading && chats.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma conversa ainda</p>
              <p className="text-sm">Clique no + para iniciar</p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => selecionarChat(chat)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                  chatAtivo?.id === chat.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 relative">
                    {chat.tipo === 'GRUPO' ? (
                      <Users size={20} />
                    ) : (
                      chat.nome.charAt(0).toUpperCase()
                    )}
                    {/* Badge de não lidas */}
                    {chat.quantidadeNaoLidas && chat.quantidadeNaoLidas > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {chat.quantidadeNaoLidas > 99 ? '99+' : chat.quantidadeNaoLidas}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      {/* Para privado, mostra o nome do outro usuário; para grupo, mostra o nome do grupo */}
                      <p className="font-semibold text-gray-800 truncate">
                        {chat.tipo === 'PRIVADO' ? (chat.outroUsuario || chat.nome) : chat.nome}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {chat.horaUltimaMensagem}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.ultimaMensagem}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-4 border-t border-gray-200 hover:bg-red-50 text-red-600 flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>

      {/* Chat Principal */}
      <div className="flex-1 flex flex-col">
        {chatAtivo ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSidebar(!showSidebar)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu size={20} />
                </button>
                
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {chatAtivo.tipo === 'GRUPO' ? (
                    <Users size={20} />
                  ) : (
                    chatAtivo.nome.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800">{chatAtivo.nome}</h3>
                  <p className="text-xs text-gray-500">
                    {chatAtivo.tipo === 'GRUPO' 
                      ? `${chatAtivo.participantes.length} participantes`
                      : 'Online'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loading && mensagens.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : mensagens.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Seja o primeiro a enviar!</p>
                  </div>
                </div>
              ) : (
                mensagens.map((msg) => {
                  const isOwn = msg.remetenteId === user.id;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md`}>
                        {!isOwn && chatAtivo.tipo === 'GRUPO' && (
                          <p className="text-xs text-gray-600 mb-1 px-3">{msg.remetenteNome}</p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          <p className="break-words">{msg.conteudo}</p>
                          <p className={`text-xs mt-1 ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                            {formatMessageTime(msg.enviadoEm)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && enviarMensagem()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={!wsConnectedRef.current}
                />
                <button
                  onClick={enviarMensagem}
                  disabled={!novaMensagem.trim() || !wsConnectedRef.current}
                  className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
              {!wsConnectedRef.current && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  Desconectado - Tentando reconectar...
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500 mt-2">
                Escolha um chat na lista ou inicie uma nova conversa
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Chat */}
      {showNovoChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nova Conversa</h3>
              <button
                onClick={() => {
                  setShowNovoChat(false);
                  setUsuariosSelecionados([]);
                  setSearchUsuario('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              value={searchUsuario}
              onChange={(e) => setSearchUsuario(e.target.value)}
              placeholder="Buscar usuário..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 outline-none"
            />

            {/* Usuários Selecionados */}
            {usuariosSelecionados.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {usuariosSelecionados.map((userId) => {
                  const usuario = usuarios.find(u => u.id === userId);
                  return (
                    <div
                      key={userId}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{usuario?.nome}</span>
                      <button
                        onClick={() =>
                          setUsuariosSelecionados(prev =>
                            prev.filter(id => id !== userId)
                          )
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
              {usuariosFiltrados.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Nenhum usuário encontrado</p>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <button
                    key={usuario.id}
                    onClick={() => {
                      if (usuariosSelecionados.includes(usuario.id)) {
                        setUsuariosSelecionados(prev =>
                          prev.filter(id => id !== usuario.id)
                        );
                      } else {
                        setUsuariosSelecionados(prev => [...prev, usuario.id]);
                      }
                    }}
                    className={`w-full p-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      usuariosSelecionados.includes(usuario.id)
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    disabled={loading}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      usuariosSelecionados.includes(usuario.id)
                        ? 'bg-blue-600'
                        : 'bg-gradient-to-br from-blue-400 to-purple-500'
                    }`}>
                      {usuariosSelecionados.includes(usuario.id) ? (
                        <div className="text-lg">✓</div>
                      ) : (
                        usuario.nome.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{usuario.nome}</p>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Botão Criar */}
            <button
              onClick={() => criarNovoChat()}
              disabled={loading || usuariosSelecionados.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {loading ? 'Criando...' : `Criar ${usuariosSelecionados.length > 1 ? 'Grupo' : 'Chat'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ChatCorporativoContent />
    </AuthProvider>
  );
};

export default App;