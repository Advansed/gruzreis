// src/services/socketService.ts

import { io, Socket } from 'socket.io-client';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error' | 'authenticating';

export interface SocketConfig {
  url: string;
  token?: string;
  autoReconnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    guid: string;
    token: string;
    phone: string;
    name: string;
    email: string;
    image: string;
    user_type: number;
    ratings: {
      orders: number;
      rate: number;
      payd: number;
    };
    description: string;
    notifications: {
      email: boolean;
      sms: boolean;
      orders: boolean;
      market: boolean;
    };
  };
  message?: string;
}

export class SocketService {
  private static instance: SocketService | null = null;
  private socket: Socket | null = null;
  private config: SocketConfig | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempt = 0;
  private authPromise: Promise<AuthResponse> | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Подключение для авторизации (без токена)
  connectForAuth(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setStatus('connecting');

        this.socket = io(url, {
          path: '/node/socket.io/',
          transports: ['websocket'],
          forceNew: true,
          reconnection: false
        });

        this.socket.on('connect', () => {
          this.setStatus('connected');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.setStatus('error');
          reject(error);
        });

        this.socket.on('disconnect', () => {
          this.setStatus('disconnected');
        });

      } catch (error) {
        this.setStatus('error');
        reject(error);
      }
    });
  }

  // Авторизация через сокет
  authorize(login: string, password: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.setStatus('authenticating');

      // Таймаут для авторизации
      const timeout = setTimeout(() => {
        this.socket?.off('authorization', authHandler);
        reject(new Error('Authorization timeout'));
      }, 10000); // 10 секунд

      const authHandler = (response: AuthResponse) => {
        clearTimeout(timeout);
        this.socket?.off('authorization', authHandler);
        resolve(response);
      };

      // Подписываемся на ответ
      this.socket.on('authorization', authHandler);

      // Отправляем данные авторизации
      this.socket.emit('authorization', { login, password });
    });
  }

  // Обычное подключение с токеном
  connect(config: SocketConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.config = { 
          autoReconnect: true, 
          reconnectAttempts: 5, 
          reconnectDelay: 1000,
          ...config 
        };

        this.setStatus('connecting');

        this.socket = io(config.url, {
          path: '/node/socket.io/',
          auth: { token: config.token },
          transports: ['websocket'],
          forceNew: true,
          reconnection: false
        });

        this.socket.on('connect', () => {
          this.setStatus('connected');
          this.reconnectAttempt = 0;
          this.restoreListeners();
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          this.setStatus('disconnected');
          if (this.config?.autoReconnect && reason === 'io server disconnect') {
            this.handleReconnect();
          }
        });

        this.socket.on('connect_error', (error) => {
          this.setStatus('error');
          if (this.reconnectAttempt === 0) {
            reject(error);
          } else {
            this.handleReconnect();
          }
        });

      } catch (error) {
        this.setStatus('error');
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.setStatus('disconnected');
    this.listeners.clear();
    this.authPromise = null;
  }

  emit(event: string, data?: any): boolean {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      return true;
    }
    return false;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    if (this.socket?.connected) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      const eventListeners = this.listeners.get(event) || [];
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
        if (eventListeners.length === 0) {
          this.listeners.delete(event);
        }
      }
      this.socket?.off(event, callback as any);
    } else {
      this.listeners.delete(event);
      this.socket?.off(event);
    }
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.socket?.connected === true;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('socket_status_changed', { 
        detail: { status } 
      }));
    }
  }

  private handleReconnect(): void {
    if (!this.config?.autoReconnect) return;
    
    if (this.reconnectAttempt >= (this.config.reconnectAttempts || 5)) {
      this.setStatus('error');
      return;
    }

    this.reconnectAttempt++;
    this.setStatus('reconnecting');

    setTimeout(() => {
      if (this.config) {
        this.connect(this.config).catch(() => {
          // Ошибка переподключения обработается в connect
        });
      }
    }, (this.config.reconnectDelay || 1000) * this.reconnectAttempt);
  }

  private restoreListeners(): void {
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket?.on(event, callback as any);
      });
    });
  }
}