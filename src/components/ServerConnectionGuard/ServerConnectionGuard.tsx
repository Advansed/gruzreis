// src/components/ServerConnectionGuard/ServerConnectionGuard.tsx

import React, { useEffect, useState } from 'react';
import { ReconnectToServerForm } from '../ReconnectToServerForm/ReconnectToServerForm';

interface ServerConnectionGuardProps {
  children: React.ReactNode;
}

export const ServerConnectionGuard: React.FC<ServerConnectionGuardProps> = ({ children }) => {
  const [isServerAvailable, setIsServerAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkServerHealth = async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Простая проверка доступности сервера
      const response = await fetch('https://gruzreis.ru/api/health', {
        method: 'GET',
        timeout: 10000
      } as any);

      if (response.ok) {
        setIsServerAvailable(true);
        setError(null);
      } else {
        throw new Error(`Сервер недоступен (${response.status})`);
      }
    } catch (err: any) {
      setIsServerAvailable(false);
      setError(err.message || 'Ошибка подключения к серверу');
    } finally {
      setIsChecking(false);
    }
  };

  // Проверка при загрузке
  useEffect(() => {
    checkServerHealth();
  }, []);

  // Если сервер доступен - показываем приложение
  if (isServerAvailable) {
    return <>{children}</>;
  }

  // Показываем форму переподключения
  return (
    <ReconnectToServerForm 
      isConnecting={isChecking}
      error={error}
      onRetry={checkServerHealth}
    />
  );
};