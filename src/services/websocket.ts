// athena-chat/src/services/websocket.ts
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Mensagem } from '../types/index';

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private connected: boolean = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => {
          // 🔑 Configurar SockJS para enviar cookies
          const sockJS = new SockJS('http://localhost:8080/ws', null, {
            transport: ['websocket', 'xhr-streaming', 'xhr-polling']
          } as any);
          return sockJS;
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: () => {
          this.connected = true;
          console.log('✅ WebSocket conectado');
          console.log('🍪 Cookies sendo enviados no WebSocket');
          resolve();
        },

        onStompError: (frame) => {
          console.error('❌ Erro STOMP:', frame.headers['message']);
          console.error('Detalhes:', frame.body);
          reject(new Error(frame.headers['message']));
        },

        onWebSocketError: (event) => {
          console.error('❌ Erro WebSocket:', event);
          reject(event);
        },

        onDisconnect: () => {
          this.connected = false;
          console.log('🔌 WebSocket desconectado');
        }
      });

      this.client.activate();
    });
  }

  subscribeToChat(chatId: number, callback: (message: Mensagem) => void): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket não conectado. Chame connect() primeiro.');
      return;
    }

    const destination = `/topic/chats/${chatId}`;

    // Remove inscrição anterior se existir
    if (this.subscriptions.has(destination)) {
      this.subscriptions.get(destination)?.unsubscribe();
    }

    // Nova inscrição
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const mensagem: Mensagem = JSON.parse(message.body);
        console.log('📩 Mensagem recebida:', mensagem);
        callback(mensagem);
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`🔔 Inscrito no chat ${chatId}`);
  }

  unsubscribeFromChat(chatId: number): void {
    const destination = `/topic/chats/${chatId}`;
    const subscription = this.subscriptions.get(destination);
    
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`🔕 Desinscrito do chat ${chatId}`);
    }
  }

  sendMessage(chatId: number, mensagem: Partial<Mensagem>): void {
    if (!this.client || !this.connected) {
      console.error('WebSocket não conectado');
      return;
    }

    try {
      this.client.publish({
        destination: `/app/chats/${chatId}/send`,
        body: JSON.stringify(mensagem)
      });
      console.log('📤 Mensagem enviada');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  }

  disconnect(): void {
    // Desinscrever de todos os chats
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.clear();

    // Desconectar
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    
    this.connected = false;
    console.log('👋 WebSocket desconectado');
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Exportação padrão da instância única do serviço
export default new WebSocketService();