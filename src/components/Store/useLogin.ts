// src/components/Store/useLogin.ts

import { useCallback } from 'react'
import { 
  UniversalStore, 
  useStore, 
  TState
} from './Store'
import { useToast } from '../Toast'
import { socketService } from '../../services/socketService'

// ============================================
// ТИПЫ
// ============================================

export interface UserRatings {
  orders: number;
  rate: number;
  payd: number;
}

export interface UserNotifications {
  email: boolean;
  sms: boolean;
  orders: boolean;
  market: boolean;
}

export interface AuthResponse {
    guid: string;
    token: string;
    phone: string;
    name: string;
    email: string;
    image: string;
    user_type: number;
    ratings: UserRatings;
    description: string;
    notifications: UserNotifications;
}

export interface AppState extends TState {
  auth:               boolean
  id:                 string | null
  name:               string | null
  phone:              string | null
  email:              string | null
  image:              string | null
  token:              string | null
  user_type:          number | null
  description:        string | null
  ratings:            UserRatings | null
  notifications:      UserNotifications | null
  isLoading:          boolean
  socketConnected:    boolean
}

// ============================================
// STORE
// ============================================

export const appStore = new UniversalStore<AppState>({
  initialState: { 
    auth: false,
    id: null,
    name: null,
    phone: null,
    email: null,
    image: null,
    token: null,
    user_type: null,
    description: null,
    ratings: null,
    notifications: null,
    isLoading: false,
    socketConnected: false
  },
  enableLogging: true
})

// ============================================
// HOOK
// ============================================

export function useLogin() {
  const auth              = useStore((state: AppState) => state.auth, 1001, appStore)
  const id                = useStore((state: AppState) => state.id, 1002, appStore)
  const name              = useStore((state: AppState) => state.name, 1003, appStore)
  const phone             = useStore((state: AppState) => state.phone, 1004, appStore)
  const email             = useStore((state: AppState) => state.email, 1005, appStore)
  const image             = useStore((state: AppState) => state.image, 1006, appStore)
  const token             = useStore((state: AppState) => state.token, 1007, appStore)
  const user_type         = useStore((state: AppState) => state.user_type, 1008, appStore)
  const description       = useStore((state: AppState) => state.description, 1009, appStore)
  const ratings           = useStore((state: AppState) => state.ratings, 1010, appStore)
  const notifications     = useStore((state: AppState) => state.notifications, 1011, appStore)
  const isLoading         = useStore((state: AppState) => state.isLoading, 1012, appStore)
  const socketConnected   = useStore((state: AppState) => state.socketConnected, 1013, appStore)

  const toast = useToast()

  const login = useCallback(async (phoneNumber: string, password: string): Promise<boolean> => {
    
    appStore.dispatch({ type: 'isLoading', data: true })

    try {
      const socket = socketService.getSocket();
      if (!socket) {
        throw new Error('Socket не подключен');
      }

      return new Promise((resolve) => {

        // Обработчик ответа на авторизацию
        const handleAuthResponse = (response: any) => {

          if (response.success && response.data) {
            const userData = response.data;
            
            // Сохраняем данные пользователя
            appStore.dispatch({ type: 'auth',           data: true })
            appStore.dispatch({ type: 'id',             data: userData.guid })
            appStore.dispatch({ type: 'name',           data: userData.name })
            appStore.dispatch({ type: 'phone',          data: userData.phone })
            appStore.dispatch({ type: 'email',          data: userData.email })
            appStore.dispatch({ type: 'image',          data: userData.image })
            appStore.dispatch({ type: 'token',          data: userData.token })
            appStore.dispatch({ type: 'user_type',      data: userData.user_type })
            appStore.dispatch({ type: 'description',    data: userData.description })
            appStore.dispatch({ type: 'ratings',        data: userData.ratings })
            appStore.dispatch({ type: 'notifications',  data: userData.notifications })
            
            appStore.dispatch({ type: 'isLoading', data: false })
            toast.success('Авторизация успешна')
            resolve(true);
          } else {
            // Ошибка авторизации
            appStore.dispatch({ type: 'isLoading',    data: false })
            appStore.dispatch({ type: 'auth',         data: false })

            toast.error(response.message || 'Неверный логин или пароль')
            resolve(false);
          }
        };

        // Подписка на ответ и отправка запроса
        socket.once('authorization', handleAuthResponse);
        socket.emit('authorization', { login: phoneNumber, password });
      });

    } catch (error: any) {
      appStore.dispatch({ type: 'isLoading',      data: false })
      appStore.dispatch({ type: 'auth',           data: false })
      
      toast.error('Ошибка подключения к серверу')
      return false;
    }
  }, [toast])

  const logout = useCallback(() => {
    // Отключаемся от сокета
    socketService.disconnect()
    
    // Очищаем состояние
    appStore.batchUpdate({
      auth:               false,
      id:                 null,
      name:               null,
      phone:              null,
      email:              null,
      image:              null,
      token:              null,
      user_type:          null,
      description:        null,
      ratings:            null,
      notifications:      null,
      socketConnected:    false
    })

    toast.info("Выход из системы")
  }, [toast])

  return {
    auth,
    id,
    name,
    phone,
    email,
    image,
    token,
    user_type,
    description,
    ratings,
    notifications,
    isLoading,
    socketConnected,
    login,
    logout
  }
}

// ============================================
// УТИЛИТЫ
// ============================================

export const getToken = () => appStore.getState().token
export const getName = () => appStore.getState().name || ''
export const getId = () => appStore.getState().id || ''
export const isAuthenticated = () => appStore.getState().auth
export const isSocketConnected = () => appStore.getState().socketConnected