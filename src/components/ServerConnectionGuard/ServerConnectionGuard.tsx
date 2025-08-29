// src/components/ServerConnectionGuard/ServerConnectionGuard.tsx

import React, { useEffect, useState } from 'react';
import { SocketService } from '../../services/socketService';
import { SOCKET_URL } from '../Store/useLogin';
import { ReconnectToServerForm } from '../ReconnectToServerForm/ReconnectToServerForm';

interface ServerConnectionGuardProps {
  children: React.ReactNode;
}

export const ServerConnectionGuard: React.FC<ServerConnectionGuardProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const socketService = SocketService.getInstance();

  const connectToServer = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await socketService.connectForAuth(SOCKET_URL);
      setIsConnected(true);
      setIsConnecting(false);
    } catch (err: any) {
      setIsConnected(false);
      setIsConnecting(false);
      setError(err.message || 'Ошибка подключения к серверу');
    }
  };

  // Автоматическое подключение при загрузке
  useEffect(() => {
    connectToServer();

    // Слушаем события сокета
    const handleStatusChange = (event: CustomEvent) => {
      const status = event.detail.status;
      
      if (status === 'connected') {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
      } else if (status === 'disconnected' || status === 'error') {
        setIsConnected(false);
        setIsConnecting(false);
        if (status === 'error') {
          setError('Соединение с сервером потеряно');
        }
      } else if (status === 'connecting' || status === 'reconnecting') {
        setIsConnecting(true);
      }
    };

    window.addEventListener('socket_status_changed', handleStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('socket_status_changed', handleStatusChange as EventListener);
    };
  }, []);

  // Показываем основное приложение если подключены
  if (isConnected && !isConnecting) {
    return <>{children}</>;
  }

  // Показываем форму реконнекта
  return (
    <ReconnectToServerForm 
      isConnecting={isConnecting}
      error={error}
      onRetry={connectToServer}
    />
  );
};