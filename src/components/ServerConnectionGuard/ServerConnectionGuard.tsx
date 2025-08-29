// src/components/ServerConnectionGuard/ServerConnectionGuard.tsx

import React, { useEffect, useState } from 'react';
import { useSocket } from '../Store/useSocket';
import { ReconnectToServerForm } from '../ReconnectToServerForm/ReconnectToServerForm';

interface ServerConnectionGuardProps {
  children: React.ReactNode;
}

export const ServerConnectionGuard: React.FC<ServerConnectionGuardProps> = ({ children }) => {
  const [isServerAvailable, setIsServerAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isConnecting, checkServerAvailability } = useSocket();

  const checkServerConnection = async () => {
    setError(null);

    try {
      const available = await checkServerAvailability();
      
      if (available) {
        setIsServerAvailable(true);
        setError(null);
      } else {
        throw new Error('Не удалось подключиться к серверу');
      }
    } catch (err: any) {
      setIsServerAvailable(false);
      setError(err.message || 'Сервер недоступен');
    }
  };

  // Проверка при загрузке
  useEffect(() => {
    checkServerConnection();
  }, []);

  // Если сервер доступен - показываем приложение
  if (isServerAvailable) {
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