// src/components/ServerConnectionGuard/ServerConnectionGuard.tsx

import React, { useEffect, useState } from 'react';
import { useSocket } from '../Store/useSocket';
import { ReconnectToServerForm } from '../ReconnectToServerForm/ReconnectToServerForm';

interface ServerConnectionGuardProps {
  children: React.ReactNode;
}

export const ServerConnectionGuard: React.FC<ServerConnectionGuardProps> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  
  const { isConnecting, isConnected, connect } = useSocket();

  const checkServerConnection = async () => {

    console.log("check server")

    setError(null);

    try {
      
      if (isConnected) {
        console.log("connected")
      } else {
        connect('')
        //throw new Error('Не удалось подключиться к серверу');
      }
    } catch (err: any) {
      setError(err.message || 'Сервер недоступен');
    }
  };

  // Проверка при загрузке
  useEffect(() => {
    checkServerConnection();
  }, []);

  // Если сервер доступен - показываем приложение
  if (isConnected) {
    return <>{children}</>;
  }

  // Показываем форму переподключения
  return (
    <ReconnectToServerForm 
      isConnecting={isConnecting}
      error={error}
      onRetry={checkServerConnection}
    />
  );
};