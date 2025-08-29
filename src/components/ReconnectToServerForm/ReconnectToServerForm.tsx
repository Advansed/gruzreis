// src/components/ReconnectToServerForm/ReconnectToServerForm.tsx

import React from 'react';
import { IonPage, IonContent, IonIcon, IonButton } from '@ionic/react';
import { 
  cloudOfflineOutline, 
  refreshOutline, 
  serverOutline,
  wifiOutline 
} from 'ionicons/icons';
import styles from './ReconnectToServerForm.module.css';

interface ReconnectToServerFormProps {
  isConnecting: boolean;
  error: string | null;
  onRetry: () => void;
}

export const ReconnectToServerForm: React.FC<ReconnectToServerFormProps> = ({ 
  isConnecting, 
  error, 
  onRetry 
}) => {
  return (
    <IonPage>
      <IonContent className={styles.container}>
        <div className={styles.card}>
          
          {/* Иконка */}
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

          {/* Заголовок */}
          <h1 className={styles.title}>
            {isConnecting ? 'Подключение к серверу...' : 'Нет связи с сервером'}
          </h1>

          {/* Сообщение */}
          <p className={styles.message}>
            {isConnecting 
              ? 'Устанавливаем соединение с сервером. Пожалуйста, подождите.'
              : 'Не удалось подключиться к серверу. Проверьте интернет-соединение и повторите попытку.'
            }
          </p>

          {/* Ошибка */}
          {error && !isConnecting && (
            <div className={styles.error}>
              <IonIcon icon={serverOutline} />
              <span>{error}</span>
            </div>
          )}

          {/* Прогресс при подключении */}
          {isConnecting && (
            <div className={styles.progress}>
              <div className={styles.progressBar}></div>
            </div>
          )}

          {/* Кнопка повтора */}
          {!isConnecting && (
            <IonButton 
              expand="block" 
              size="large"
              onClick={onRetry}
              className={styles.retryButton}
            >
              <IonIcon icon={refreshOutline} slot="start" />
              Повторить подключение
            </IonButton>
          )}

          {/* Информация */}
          <div className={styles.info}>
            <p>Убедитесь что:</p>
            <ul>
              <li>Есть подключение к интернету</li>
              <li>Сервер доступен</li>
              <li>Нет блокировки файрвола</li>
            </ul>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};