// src/components/Store/useLogin.ts

import { useCallback } from 'react'
import { 
  UniversalStore, 
  useStore, 
  TState 
} from './Store'
import { useToast } from '../Toast'
import { SocketService } from '../../services/socketService'

// ============================================
// КОНФИГУРАЦИЯ
// ============================================

export const SOCKET_URL = "https://gruzreis.ru"

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
  success: boolean;
  data?: {
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
  };
  message?: string;
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
  authStatus:         'idle' | 'connecting' | 'authenticating' | 'success' | 'error'
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
    socketConnected: false,
    authStatus: 'idle',
    error: null
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
  const authStatus        = useStore((state: AppState) => state.authStatus, 1014, appStore)

  const toast = useToast()
  const socketService = SocketService.getInstance()

  // Подключение к сокету после успешной авторизации
  const connectSocket = useCallback(async (authToken: string) => {
    try {
      await socketService.connect({
        url: SOCKET_URL,
        token: authToken
      });
      
      appStore.dispatch({ type: 'socketConnected', data: true })
      
      // Подписываемся на события сокета
      socketService.on('disconnect', () => {
        appStore.dispatch({ type: 'socketConnected', data: false })
      });
      
      socketService.on('connect', () => {
        appStore.dispatch({ type: 'socketConnected', data: true })
      });
      
    } catch (error) {
      console.error('Socket connection failed:', error);
      appStore.dispatch({ type: 'socketConnected', data: false })
      throw error;
    }
  }, [socketService])

  const login = useCallback(async (phoneNumber: string, password: string): Promise<boolean> => {
    appStore.dispatch({ type: 'isLoading', data: true })
    appStore.dispatch({ type: 'authStatus', data: 'connecting' })

    try {
      // 1. Подключаемся к серверу для авторизации
      await socketService.connectForAuth(SOCKET_URL);
      
      // 2. Отправляем данные авторизации
      appStore.dispatch({ type: 'authStatus', data: 'authenticating' })
      const authResponse: AuthResponse = await socketService.authorize(phoneNumber, password);

      if (authResponse.success && authResponse.data) {
        const userData = authResponse.data;
        
        // 3. Сохраняем все данные пользователя
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
        appStore.dispatch({ type: 'authStatus',     data: 'success' })
        appStore.dispatch({ type: 'error',          data: null })
        
        // 4. Отключаемся от авторизационного сокета
        socketService.disconnect();
        
        // 5. Подключаемся с токеном к основному приложению
        await connectSocket(userData.token);
        
        appStore.dispatch({ type: 'isLoading', data: false })
        toast.success('Авторизация успешна')

        return true;
      } else {
        // Ошибка авторизации
        appStore.dispatch({ type: 'authStatus',   data: 'error' })
        appStore.dispatch({ type: 'isLoading',    data: false })
        appStore.dispatch({ type: 'auth',         data: false })
        appStore.dispatch({ type: 'error',        data: authResponse.message || 'Ошибка авторизации' })

        toast.error(authResponse.message || 'Неверный логин или пароль')
        socketService.disconnect();
        
        return false;
      }

    } catch (error: any) {
      appStore.dispatch({ type: 'authStatus',     data: 'error' })
      appStore.dispatch({ type: 'isLoading',      data: false })
      appStore.dispatch({ type: 'auth',           data: false })
      
      let errorMessage = 'Ошибка подключения';
      if (error.message === 'Authorization timeout') {
        errorMessage = 'Превышено время ожидания авторизации';
      } else if (error.message.includes('connect')) {
        errorMessage = 'Не удалось подключиться к серверу';
      }
      
      appStore.dispatch({ type: 'error', data: errorMessage })
      toast.error(errorMessage)
      
      socketService.disconnect();
      return false;
    }
  }, [connectSocket, toast, socketService])

  const logout = useCallback(() => {
    // Отключаемся от сокета
    socketService.disconnect()
    
    appStore.dispatch({ type: 'auth',             data: false })
    appStore.dispatch({ type: 'id',               data: null })
    appStore.dispatch({ type: 'name',             data: null })
    appStore.dispatch({ type: 'phone',            data: null })
    appStore.dispatch({ type: 'email',            data: null })
    appStore.dispatch({ type: 'image',            data: null })
    appStore.dispatch({ type: 'token',            data: null })
    appStore.dispatch({ type: 'user_type',        data: null })
    appStore.dispatch({ type: 'description',      data: null })
    appStore.dispatch({ type: 'ratings',          data: null })
    appStore.dispatch({ type: 'notifications',    data: null })
    appStore.dispatch({ type: 'error',            data: null })
    appStore.dispatch({ type: 'socketConnected',  data: false })
    appStore.dispatch({ type: 'authStatus',       data: 'idle' })

    toast.info("Выход с авторизации")
  }, [socketService, toast])

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
    authStatus,
    login,
    logout,
    connectSocket
  }
}


// ============================================
// УТИЛИТЫ ДЛЯ ДРУГИХ КОМПОНЕНТОВ
// ============================================

export const getToken = () => appStore.getState().token
export const getName = () => appStore.getState().name || ''
export const getRole = () => appStore.getState().role || ''
export const getId = () => appStore.getState().id || ''
export const isAuthenticated = () => appStore.getState().auth
export const isSocketConnected = () => appStore.getState().socketConnected
export const getAuthStatus = () => appStore.getState().authStatus

export const getAuthData = () => {
  const state = appStore.getState()
  return {
    auth: state.auth,
    id: state.id,
    name: state.name,
    token: state.token,
    role: state.role,
    socketConnected: state.socketConnected,
    authStatus: state.authStatus
  }
}