// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  private readonly SERVER_URL   = 'https://gruzreis.ru';
  private readonly SOCKET_PATH  = '/node/socket.io/';

  // Подключение к серверу
  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(true);
        return;
      }

      this.socket = io(this.SERVER_URL, {
        path: this.SOCKET_PATH,
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        timeout: 20000
      });

      // Обработка подключения
      this.socket.on('connect', () => {
        console.log('Подключен к Socket.IO серверу');
        this.isConnected = true;
        resolve(true);
      });

      // Обработка отключения
      this.socket.on('disconnect', () => {
        console.log('Отключен от Socket.IO сервера');
        this.isConnected = false;
      });

      // Обработка ошибок подключения
      this.socket.on('connect_error', (error) => {
        console.error('Ошибка подключения:', error);
        reject(error);
      });
    });
  }

  // Отправка произвольного события
  emit(eventName: string, data: any): boolean {
    if (!this.socket?.connected) {
      console.error('Socket не подключен');
      return false;
    }
        
    this.socket.emit(eventName, data);
    return true;
  }

  // Отключение
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Проверка подключения
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Получение статуса
  getStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
    };
  }
    
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Экспорт синглтона
export const socketService = new SocketService();
export default socketService;