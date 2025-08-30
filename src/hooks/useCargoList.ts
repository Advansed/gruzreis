// src/hooks/useCargoList.ts

import { useCallback, useEffect, useMemo } from 'react';
import { UniversalStore, useStore, TState } from '../components/Store/Store';
import { useSocket } from '../components/Store/useSocket';
import { useLogin } from '../components/Store/useLogin';
import { useToast } from '../components/Toast';

// ============================================
// ТИПЫ
// ============================================

export interface CargoAddress {
  address: string;
  coordinates?: [number, number];
}

export interface CargoInvoice {
  id: string;
  cargo: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  transport: string;
  price: number;
  weight: number;
  volume: number;
  status: string;
  createdAt: string;
  rating: string;
}

export interface Cargo {
  guid: string;
  name: string;
  description: string;
  address: CargoAddress;
  destiny: CargoAddress;
  phone: string;
  face: string;
  weight: number;
  weight1: number;
  volume: number;
  price: number;
  cost: number;
  advance: number;
  pickup_date: string;
  delivery_date: string;
  status: 'Новый' | 'Есть заказы' | 'В работе' | 'В ожидании' | 'Выполнено';
  invoices: CargoInvoice[];
}

export type CargoStatus = 'Новый' | 'Есть заказы' | 'В работе' | 'В ожидании' | 'Выполнено' | 'Все';

export interface CargoFormData {
  guid?: string;
  name: string;
  description: string;
  address: CargoAddress;
  destiny: CargoAddress;
  phone: string;
  face: string;
  weight: number;
  volume: number;
  price: number;
  cost: number;
  advance: number;
  pickup_date: string;
  delivery_date: string;
}

export interface CargoState extends TState {
  cargos: Cargo[];
  loading: boolean;
  error: string | null;
  statusFilter: CargoStatus;
  searchQuery: string;
}

// ============================================
// CARGO STORE
// ============================================

export const cargoStore = new UniversalStore<CargoState>({
  initialState: {
    cargos: [],
    loading: false,
    error: null,
    statusFilter: 'Все',
    searchQuery: ''
  },
  enableLogging: true
});

// ============================================
// ХУКИ
// ============================================

export function useCargoList() {
  const cargos          = useStore((state: CargoState) => state.cargos, 3001, cargoStore);
  const loading         = useStore((state: CargoState) => state.loading, 3002, cargoStore);
  const error           = useStore((state: CargoState) => state.error, 3003, cargoStore);
  const statusFilter    = useStore((state: CargoState) => state.statusFilter, 3004, cargoStore);
  const searchQuery     = useStore((state: CargoState) => state.searchQuery, 3005, cargoStore);

  const { emit, on }    = useSocket();
  const { token }       = useLogin();
  const toast           = useToast();

  // ============================================
  // SOCKET EVENT HANDLERS
  // ============================================

  useEffect(() => {
    // Обработка ответа get_cargos
    const unsubscribeGetCargos = on('get_cargos', (response: any) => {
      cargoStore.dispatch({ type: 'loading', data: false });
      
      if (response.success) {
        cargoStore.dispatch({ type: 'cargos', data: response.data || [] });
        cargoStore.dispatch({ type: 'error', data: null });
      } else {
        cargoStore.dispatch({ type: 'error', data: response.message || 'Ошибка загрузки' });
        toast.error(response.message || 'Ошибка загрузки грузов');
      }
    });

    // Обработка ответа set_cargo
    const unsubscribeSetCargo = on('set_cargo', (response: any) => {
      cargoStore.dispatch({ type: 'loading', data: false });
      
      if (response.success) {
        toast.success('Груз успешно сохранен');
        loadCargos(); // Обновляем список
      } else {
        toast.error(response.message || 'Ошибка при сохранении груза');
      }
    });

    // Обработка ответа publish
    const unsubscribePublish = on('publish', (response: any) => {
      cargoStore.dispatch({ type: 'loading', data: false });
      
      if (response.success) {
        toast.success('Груз успешно опубликован');
        loadCargos(); // Обновляем список
      } else {
        toast.error(response.message || 'Ошибка при публикации груза');
      }
    });

    return () => {
      unsubscribeGetCargos();
      unsubscribeSetCargo();
      unsubscribePublish();
    };
  }, [on, toast]);

  // ============================================
  // ЗАГРУЗКА ДАННЫХ
  // ============================================

  const loadCargos = useCallback(async () => {
    if (!token) {
      cargoStore.dispatch({ type: 'error', data: 'Токен не найден' });
      return;
    }

    cargoStore.dispatch({ type: 'loading', data: true });
    cargoStore.dispatch({ type: 'error', data: null });

    try {
      emit('get_cargos', { token });
    } catch (err) {
      cargoStore.dispatch({ type: 'loading', data: false });
      cargoStore.dispatch({ type: 'error', data: 'Ошибка при загрузке грузов' });
      toast.error('Ошибка при загрузке грузов');
    }
  }, [token, emit]);

  // ============================================
  // СОЗДАНИЕ/ОБНОВЛЕНИЕ ГРУЗА
  // ============================================

  const saveCargo = useCallback(async (cargoData: CargoFormData) => {
    if (!token) {
      toast.error('Токен не найден');
      return false;
    }

    cargoStore.dispatch({ type: 'loading', data: true });

    try {
      const payload = {
        token,
        guid: cargoData.guid || null,
        name: cargoData.name,
        description: cargoData.description,
        address: cargoData.address,
        destiny: cargoData.destiny,
        phone: cargoData.phone,
        face: cargoData.face,
        weight: cargoData.weight,
        volume: cargoData.volume,
        price: cargoData.price,
        cost: cargoData.cost,
        advance: cargoData.advance,
        pickup_date: cargoData.pickup_date,
        delivery_date: cargoData.delivery_date
      };

      emit('set_cargo', payload);
      return true;
    } catch (err) {
      cargoStore.dispatch({ type: 'loading', data: false });
      toast.error('Ошибка при сохранении груза');
      return false;
    }
  }, [token, emit]);

  // ============================================
  // ПУБЛИКАЦИЯ ГРУЗА
  // ============================================

  const publishCargo = useCallback(async (guid: string) => {
    if (!token) {
      toast.error('Токен не найден');
      return false;
    }

    cargoStore.dispatch({ type: 'loading', data: true });

    try {
      emit('publish', { token, guid });
      return true;
    } catch (err) {
      cargoStore.dispatch({ type: 'loading', data: false });
      toast.error('Ошибка при публикации груза');
      return false;
    }
  }, [token, emit]);

  // ============================================
  // ФИЛЬТРАЦИЯ И ПОИСК
  // ============================================

  const setStatusFilter = useCallback((status: CargoStatus) => {
    cargoStore.dispatch({ type: 'statusFilter', data: status });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    cargoStore.dispatch({ type: 'searchQuery', data: query });
  }, []);

  const filteredCargos = useMemo(() => {
    let result = cargos;

    // Фильтр по статусу
    if (statusFilter !== 'Все') {
      result = result.filter(cargo => cargo.status === statusFilter);
    }

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(cargo => 
        cargo.name.toLowerCase().includes(query) ||
        cargo.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [cargos, statusFilter, searchQuery]);

  // ============================================
  // УТИЛИТЫ
  // ============================================

  const getStatusBadgeProps = useCallback((status: string) => {
    const statusMap = {
      'Новый': { color: 'primary', icon: 'add-circle-outline' },
      'Есть заказы': { color: 'warning', icon: 'car-outline' },
      'В работе': { color: 'tertiary', icon: 'time-outline' },
      'В ожидании': { color: 'medium', icon: 'pause-circle-outline' },
      'Выполнено': { color: 'success', icon: 'checkmark-circle-outline' }
    };

    return statusMap[status as keyof typeof statusMap] || { color: 'medium', icon: 'help-outline' };
  }, []);

  const formatAddress = useCallback((address: CargoAddress | string) => {
    if (typeof address === 'string') return address;
    return address?.address || '';
  }, []);

  const refreshList = useCallback(() => {
    loadCargos();
  }, [loadCargos]);

  const clearFilters = useCallback(() => {
    cargoStore.batchUpdate({
      statusFilter: 'Все',
      searchQuery: ''
    });
  }, []);

  // Автоматическая загрузка при монтировании
  useEffect(() => {
    if (token) {
      loadCargos();
    }
  }, [token, loadCargos]);

  // ============================================
  // ВОЗВРАЩАЕМЫЙ API
  // ============================================

  return {
    // State (из Store)
    cargos,
    loading,
    error,
    filteredCargos,
    statusFilter,
    searchQuery,

    // Actions
    loadCargos,
    saveCargo,
    publishCargo,

    // Filters
    setStatusFilter,
    setSearchQuery,
    clearFilters,

    // Utils
    getStatusBadgeProps,
    formatAddress,
    refreshList
  };
}