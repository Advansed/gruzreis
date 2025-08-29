// src/components/Store/useSocket.ts

import { useEffect, useState, useCallback } from 'react';
import { socketService } from '../../services/socketService';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Отслеживание состояния подключения
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      setIsConnecting(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setIsConnecting(false);
    };

    const handleConnecting = () => {
      setIsConnecting(true);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connecting', handleConnecting);

    // Установка начального состояния
    setIsConnected(socketService.isSocketConnected());

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connecting', handleConnecting);
    };
  }, [socketService.getSocket()?.id]);

  // Подключение
  const connect = useCallback(async (token: string) => {
    try {
      setIsConnecting(true);
      const success = await socketService.connect(token);
      return success;
    } catch (error) {
      console.error('Socket connection failed:', error);
      setIsConnecting(false);
      return false;
    }
  }, []);

  // Отключение
  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Отправка события
  const emit = useCallback((event: string, data?: any) => {
    return socketService.emit(event, data);
  }, []);

  // Подписка на событие
  const on = useCallback((event: string, callback: Function) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.on(event, callback as any);
    }
    
    // Возвращаем функцию для отписки
    return () => {
      const currentSocket = socketService.getSocket();
      if (currentSocket) {
        currentSocket.off(event, callback as any);
      }
    };
  }, []);

  return {
    // Состояние
    isConnected,
    isConnecting,
    
    // Методы
    connect,
    disconnect,
    emit,
    on,
    
    // Утилиты
    getSocket: () => socketService.getSocket(),
    getStatus: () => socketService.getStatus()
  };
}