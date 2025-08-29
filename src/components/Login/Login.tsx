// src/components/Login/Login.tsx

import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText
} from '@ionic/react';
import { 
  carOutline, 
  callOutline, 
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logInOutline,
  mapOutline
} from 'ionicons/icons';
import { useLogin } from '../Store/useLogin';
import styles from './Login.module.css';
import { InputMask } from '@react-input/mask';
import PhoneInput from '../PhoneInput';


const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{phone?: string; password?: string}>({});

  const { login, isLoading, auth } = useLogin();

  // Редирект при успешной авторизации
  useEffect(() => {
    if (auth) {
      window.location.href = '/folder/Inbox';
    }
  }, [auth]);

  // Форматирование номера телефона
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('8')) {
      return '+7' + numbers.slice(1);
    }
    if (numbers.startsWith('7')) {
      return '+' + numbers;
    }
    if (numbers.length <= 10) {
      return '+7' + numbers;
    }
    return value;
  };

  const handlePhoneChange = (e: any) => {
    const formatted = formatPhone( e );
    setPhone(formatted);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
  };

  const handlePasswordChange = (e: any) => {
    setPassword(e.detail.value!);
    if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
  };

  const validateForm = () => {
    const newErrors: {phone?: string; password?: string} = {};
    
    if (!phone || phone.length < 12) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    if (!password || password.length < 4) {
      newErrors.password = 'Пароль должен содержать минимум 4 символа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const cleanPhone = phone.replace(/\D/g, '');
    await login(cleanPhone, password);
  };

  return (
    <IonPage>
      <IonContent className={styles.container}>
        
        {/* Фоновые элементы */}
        <div className={styles.background}>
          <div className={styles.road}></div>
          <div className={styles.truck}></div>
        </div>

        {/* Основная карточка */}
        <div className={styles.loginCard}>
          
          {/* Заголовок */}
          <div className={styles.header}>
            <IonIcon icon={carOutline} className={styles.headerIcon} />
            <h1 className={styles.title}>ГРУЗ В РЕЙС</h1>
            <p className={styles.subtitle}>Система управления грузоперевозками</p>
          </div>

          {/* Форма */}
          <div className={styles.form}>
            
            {/* Поле телефона */}
            <IonItem className={styles.inputItem} >
              <IonIcon icon={callOutline} slot="start" className={styles.inputIcon} />
              <IonLabel position="stacked">Номер телефона</IonLabel>

              <PhoneInput 
                onValueChange = { handlePhoneChange }
              />

            </IonItem>
            {errors.phone && (
              <IonText color="danger" className={styles.errorText}>
                {errors.phone}
              </IonText>
            )}

            {/* Поле пароля */}
            <IonItem className={styles.inputItem} >
              <IonIcon icon={lockClosedOutline} slot="start" className={styles.inputIcon} />
              <IonLabel position="stacked">Пароль</IonLabel>
              <IonInput
                type={showPassword ? 'text' : 'password'}
                placeholder="Введите пароль"
                value={password}
                onIonInput={handlePasswordChange}
                disabled={isLoading}
              />
              <IonButton 
                fill="clear" 
                slot="end"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
              </IonButton>
            </IonItem>
            {errors.password && (
              <IonText color="danger" className={styles.errorText}>
                {errors.password}
              </IonText>
            )}

            {/* Кнопка входа */}
            <IonButton 
              expand="block" 
              size="large"
              onClick={handleSubmit}
              disabled={isLoading}
              className={styles.loginButton}
            >
              {isLoading ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon icon={logInOutline} slot="start" />
                  ВОЙТИ В СИСТЕМУ
                </>
              )}
            </IonButton>

            {/* Дополнительные ссылки */}
            <div className={styles.links}>
              <IonButton fill="clear" size="small" className={styles.linkButton}>
                Забыли пароль?
              </IonButton>
              <span className={styles.linkDivider}>•</span>
              <IonButton fill="clear" size="small" className={styles.linkButton}>
                Регистрация
              </IonButton>
            </div>

          </div>
        </div>

        {/* Декоративные элементы */}
        <div className={styles.decorativeElements}>
          <IonIcon icon={mapOutline} className={styles.mapIcon} />
        </div>

      </IonContent>
    </IonPage>
  );
};

export default Login;