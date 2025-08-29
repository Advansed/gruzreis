// src/components/ConnectionStatus/ConnectionStatus.tsx

import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { 
  wifiOutline, 
  cloudOfflineOutline, 
  refreshOutline, 
  alertCircleOutline,
  checkmarkCircleOutline 
} from 'ionicons/icons';
import { useSocket, useSocketState } from '../Store/useSocket';
import styles from './ConnectionStatus.module.css';
import { useLogin } from '../Store/useLogin';

interface ConnectionStatusProps {
  onRetry?: () => void;
  showOverlay?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  onRetry, 
  showOverlay = true 
}) => {
  const { status, connect, disconnect } = useSocket();
  const { reconnectAttempts } = useSocketState();
  const { token, name } = useLogin();
  const [autoReconnect, setAutoReconnect] = useState(true);

  // Автоматическое переподключение
  useEffect(() => {
    if (status === 'disconnected' && autoReconnect && token) {
      const timer = setTimeout(() => {
        handleReconnect();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status, autoReconnect, token]);

  const handleReconnect = async () => {
    if (token) {
      const success = await connect('ws://localhost:3001', token);
      if (!success && onRetry) {
        onRetry();
      }
    }
  };

  const handleManualReconnect = () => {
    setAutoReconnect(true);
    handleReconnect();
  };

  const handleStopReconnect = () => {
    setAutoReconnect(false);
    disconnect();
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: wifiOutline,
          iconClass: styles.connecting,
          title: 'Подключение...',
          message: 'Устанавливаем соединение с сервером',
          showProgress: true
        };
      
      case 'connected':
        return {
          icon: checkmarkCircleOutline,
          iconClass: styles.connected,
          title: 'Подключено',
          message: `Добро пожаловать, ${name || 'Пользователь'}!`,
          showProgress: false
        };
      
      case 'reconnecting':
        return {
          icon: refreshOutline,
          iconClass: styles.reconnecting,
          title: 'Переподключение...',
          message: 'Восстанавливаем соединение с сервером',
          showProgress: true
        };
      
      case 'error':
        return {
          icon: alertCircleOutline,
          iconClass: styles.error,
          title: 'Ошибка соединения',
          message: 'Не удалось подключиться к серверу. Проверьте интернет-соединение.',
          showProgress: false
        };
      
      case 'disconnected':
      default:
        return {
          icon: cloudOfflineOutline,
          iconClass: styles.disconnected,
          title: 'Нет соединения',
          message: 'Соединение с сервером потеряно. Приложение недоступно.',
          showProgress: autoReconnect
        };
    }
  };

  const config = getStatusConfig();

  // Не показываем overlay если соединение установлено
  if (status === 'connected' && !showOverlay) {
    return null;
  }

  // Для подключенного состояния показываем только при showOverlay=true
  if (status === 'connected') {
    return (
      <div className={styles.overlay}>
        <div className={styles.card}>
          <div className={styles.iconContainer}>
            <IonIcon icon={config.icon} className={`${styles.icon} ${config.iconClass}`} />
          </div>
          
          <h2 className={styles.title}>{config.title}</h2>
          <p className={styles.message}>{config.message}</p>
          
          <button 
            className={styles.button} 
            onClick={() => window.location.reload()}
          >
            Продолжить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <IonIcon icon={config.icon} className={`${styles.icon} ${config.iconClass}`} />
        </div>
        
        <h2 className={styles.title}>{config.title}</h2>
        <p className={styles.message}>{config.message}</p>
        
        {config.showProgress && (
          <div className={styles.progress}>
            <div className={styles.progressBar}></div>
          </div>
        )}
        
        {reconnectAttempts > 0 && status === 'reconnecting' && (
          <p className={styles.attempts}>
            Попытка {reconnectAttempts} из 5
          </p>
        )}
        
        <div>
          {(status === 'disconnected' || status === 'error') && (
            <>
              <button 
                className={styles.button} 
                onClick={handleManualReconnect}
              >
                <IonIcon icon={refreshOutline} />
                Повторить
              </button>
              
              {autoReconnect && (
                <button 
                  className={`${styles.button} ${styles.buttonSecondary}`} 
                  onClick={handleStopReconnect}
                >
                  Остановить
                </button>
              )}
            </>
          )}
          
          {status === 'reconnecting' && (
            <button 
              className={`${styles.button} ${styles.buttonSecondary}`} 
              onClick={handleStopReconnect}
            >
              Отмена
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;