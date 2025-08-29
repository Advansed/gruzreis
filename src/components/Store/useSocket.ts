// src/components/Store/useSocket.ts

import { useEffect, useState, useCallback } from 'react';
import { SocketService, ConnectionStatus } from '../../services/socketService';
import { UniversalStore, TState } from './Store';

// Расширяем состояние для сокетов
export interface SocketState extends TState {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

// Создаем store для состояния сокетов
export const socketStore = new UniversalStore<SocketState>({
  initialState: {
    isConnected: false,
    connectionStatus: 'disconnected',
    lastConnected: null,
    reconnectAttempts: 0
  },
  enableLogging: false
});

export function useSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isConnected, setIsConnected] = useState(false);
  const socketService = SocketService.getInstance();

  // Подписываемся на изменения статуса соединения
  useEffect(() => {
    const handleStatusChange = (event: CustomEvent) => {
      const newStatus = event.detail.status as ConnectionStatus;
      const connected = newStatus === 'connected';
      
      setStatus(newStatus);
      setIsConnected(connected);
      
      // Обновляем store
      socketStore.dispatch({ type: 'connectionStatus', data: newStatus });
      socketStore.dispatch({ type: 'isConnected', data: connected });
      
      if (connected) {
        socketStore.dispatch({ type: 'lastConnected', data: new Date() });
        socketStore.dispatch({ type: 'reconnectAttempts', data: 0 });
      } else if (newStatus === 'reconnecting') {
        const current = socketStore.getState().reconnectAttempts;
        socketStore.dispatch({ type: 'reconnectAttempts', data: current + 1 });
      }
    };

    window.addEventListener('socket_status_changed', handleStatusChange as EventListener);
    
    // Инициализация текущего статуса
    const currentStatus = socketService.getStatus();
    handleStatusChange(new CustomEvent('socket_status_changed', { 
      detail: { status: currentStatus } 
    }));

    return () => {
      window.removeEventListener('socket_status_changed', handleStatusChange as EventListener);
    };
  }, [socketService]);

  // Подключение к сокету
  const connect = useCallback(async (url: string, token?: string) => {
    try {
      await socketService.connect({ url, token });
      return true;
    } catch (error) {
      console.error('Socket connection failed:', error);
      return false;
    }
  }, [socketService]);

  // Отключение от сокета
  const disconnect = useCallback(() => {
    socketService.disconnect();
  }, [socketService]);

  // Отправка сообщения
  const emit = useCallback((event: string, data?: any) => {
    return socketService.emit(event, data);
  }, [socketService]);

  // Подписка на событие
  const on = useCallback((event: string, callback: Function) => {
    socketService.on(event, callback);
    
    // Возвращаем функцию для отписки
    return () => {
      socketService.off(event, callback);
    };
  }, [socketService]);

  // Отписка от события
  const off = useCallback((event: string, callback?: Function) => {
    socketService.off(event, callback);
  }, [socketService]);

  return {
    // Состояние
    status,
    isConnected,
    
    // Методы
    connect,
    disconnect,
    emit,
    on,
    off,
    
    // Утилиты
    isReconnecting: status === 'reconnecting',
    hasError: status === 'error',
    isConnecting: status === 'connecting'
  };
}

// Хук для получения состояния из store
export function useSocketState() {
  const isConnected = socketStore.getState().isConnected;
  const connectionStatus = socketStore.getState().connectionStatus;
  const lastConnected = socketStore.getState().lastConnected;
  const reconnectAttempts = socketStore.getState().reconnectAttempts;

  return {
    isConnected,
    connectionStatus,
    lastConnected,
    reconnectAttempts
  };
}