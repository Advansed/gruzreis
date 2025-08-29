// src/components/ConnectionStatus/ConnectionStatus.tsx

import React from 'react';
import { IonIcon, IonButton } from '@ionic/react';
import { 
  wifiOutline, 
  cloudOfflineOutline, 
  refreshOutline,
  checkmarkCircleOutline 
} from 'ionicons/icons';
import { useSocket } from '../Store/useSocket';
import { useLogin } from '../Store/useLogin';
import styles from './ConnectionStatus.module.css';

interface ConnectionStatusProps {
  onRetry?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onRetry }) => {
  const { isConnected, isConnecting, connect } = useSocket();
  const { token, name } = useLogin();

  const handleReconnect = async () => {
    if (token) {
      await connect(token);
    }
    if (onRetry) {
      onRetry();
    }
  };

  // Если подключены - не показываем
  if (isConnected) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          {isConnecting ? (
            <IonIcon 
              icon={wifiOutline} 
              className={`${styles.icon} ${styles.connecting}`} 
            />
          ) : (
            <IonIcon 
              icon={cloudOfflineOutline} 
              className={`${styles.icon} ${styles.disconnected}`} 
            />
          )}
        </div>
        
        <h2 className={styles.title}>
          {isConnecting ? 'Подключение...' : 'Нет соединения'}
        </h2>
        
        <p className={styles.message}>
          {isConnecting 
            ? 'Устанавливаем соединение с сервером'
            : 'Соединение с сервером потеряно'
          }
        </p>
        
        {isConnecting && (
          <div className={styles.progress}>
            <div className={styles.progressBar}></div>
          </div>
        )}
        
        {!isConnecting && (
          <IonButton 
            expand="block"
            onClick={handleReconnect}
            className={styles.button}
          >
            <IonIcon icon={refreshOutline} slot="start" />
            Повторить
          </IonButton>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;