/**
 * Основной хук для управления грузами
 */

import { useState, useEffect, useCallback } from 'react';
import { CargoInfo, CargoStatus, PageType, CargoFilters, UseCargosReturn } from '../types';
import { SOCKET_EVENTS, EMPTY_CARGO } from '../constants';
import { dataUtils, statusUtils } from '../utils';
import { Store, useSelector } from '../../Store';
import socketService from '../../Sockets';

export const useCargos = (): UseCargosReturn => {
    // Состояние
    const cargos = useSelector((state) => state.cargos, 11);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState<PageType>({ type: 'list' });
    const [filters, setFilters] = useState<CargoFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    // История навигации для кнопки "Назад"
    const [navigationHistory, setNavigationHistory] = useState<PageType[]>([{ type: 'list' }]);

    // ======================
    // НАВИГАЦИЯ
    // ======================

    const navigateTo = useCallback((page: PageType) => {
        setNavigationHistory(prev => [...prev, currentPage]);
        setCurrentPage(page);
    }, [currentPage]);

    const goBack = useCallback(() => {
        // if (navigationHistory.length > 0) {
        //     const previousPage = navigationHistory[navigationHistory.length - 1];
        //     setNavigationHistory(prev => prev.slice(0, -1));
        //     setCurrentPage(previousPage);
        // } else {
            setCurrentPage({ type: 'list' });
        // }
    }, [navigationHistory]);

    // ======================
    // CRUD ОПЕРАЦИИ
    // ======================

    const createCargo = useCallback(async (data: Partial<CargoInfo>): Promise<boolean> => {
        setIsLoading(true);
        try {
            const newCargo: CargoInfo = {
                ...dataUtils.createEmptyCargo(),
                ...data,
                guid: dataUtils.generateGuid(),
                status: CargoStatus.NEW,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('Creating cargo:', newCargo);

            // Отправляем через socket
            socketService.emit(SOCKET_EVENTS.SAVE_CARGO, { token: Store.getState().login.token, ...newCargo});

            // Добавляем в локальный Store (оптимистичное обновление)
            const currentCargos = Store.getState().cargos || [];
            Store.dispatch({
                type: 'SET_CARGOS',
                payload: [...currentCargos, newCargo]
            });

            // Переходим к списку
            setCurrentPage({ type: 'list' });

            return true;

        } catch (error) {
            console.error('Error creating cargo:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCargo = useCallback(async (guid: string, data: Partial<CargoInfo>): Promise<boolean> => {
        setIsLoading(true);
        try {
            const currentCargos = Store.getState().cargos || [];
            const existingCargo = currentCargos.find((c: CargoInfo) => c.guid === guid);
            
            if (!existingCargo) {
                console.error('Cargo not found:', guid);
                return false;
            }

            const updatedCargo: CargoInfo = {
                ...existingCargo,
                ...data,
                updatedAt: new Date().toISOString()
            };

            console.log('Updating cargo:', updatedCargo);

            // Отправляем через socket
            socketService.emit(SOCKET_EVENTS.SAVE_CARGO, { token: Store.getState().login.token, ...updatedCargo});

            // Обновляем в локальном Store
            const updatedCargos = currentCargos.map((c: CargoInfo) => 
                c.guid === guid ? updatedCargo : c
            );
            Store.dispatch({
                type: 'SET_CARGOS',
                payload: updatedCargos
            });

            return true;

        } catch (error) {
            console.error('Error updating cargo:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteCargo = useCallback(async (guid: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const token = Store.getState().login.token;
            
            console.log('Deleting cargo:', { guid, token });

            // Отправляем через socket
            socketService.emit(SOCKET_EVENTS.DELETE_CARGO, { guid, token });

            // Удаляем из локального Store
            const currentCargos = Store.getState().cargos || [];
            const updatedCargos = currentCargos.filter((c: CargoInfo) => c.guid !== guid);
            Store.dispatch({
                type: 'SET_CARGOS',
                payload: updatedCargos
            });

            // Возвращаемся к списку
            setCurrentPage({ type: 'list' });

            return true;

        } catch (error) {
            console.error('Error deleting cargo:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const publishCargo = useCallback(async (guid: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const token = Store.getState().login.token;
            const cargo = getCargo(guid);
            
            if (!cargo) {
                console.error('Cargo not found for publishing:', guid);
                return false;
            }

            // Проверяем возможность публикации
            if (!statusUtils.canPublish(cargo.status)) {
                console.error('Cargo cannot be published in current status:', cargo.status);
                return false;
            }

            console.log('Publishing cargo:', { guid, token });

            // Отправляем через socket
            socketService.emit(SOCKET_EVENTS.PUBLISH_CARGO, { guid, token });

            // Обновляем статус в локальном Store
            await updateCargo(guid, { status: CargoStatus.WAITING });

            return true;

        } catch (error) {
            console.error('Error publishing cargo:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [updateCargo]);

    // ======================
    // УТИЛИТЫ
    // ======================

    const getCargo = useCallback((guid: string): CargoInfo | undefined => {
        const currentCargos = Store.getState().cargos || [];
        return currentCargos.find((cargo: CargoInfo) => cargo.guid === guid);
    }, []);

    const refreshCargos = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            // В реальном приложении здесь был бы API запрос
            // Пока используем существующие данные из Store
            console.log('Refreshing cargos...');
            
            socketService.emit("get_cargos", { token: Store.getState().login.token })
            socketService.emit("get_orgs", { token: Store.getState().login.token })
            
        } catch (error) {
            console.error('Error refreshing cargos:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Фильтрованный список грузов
    const filteredCargos = useCallback(() => {
        let filtered = cargos.filter(cargo => cargo.status !== CargoStatus.COMPLETED);//[...(cargos || [])];
        console.log("filtered cargo")
        console.log( filtered )

        // Поиск по названию
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(cargo => 
                cargo.name.toLowerCase().includes(query) ||
                cargo.address?.city.toLowerCase().includes(query) ||
                cargo.destiny?.city.toLowerCase().includes(query)
            );
        }

        // Фильтры
        if (filters.status && filters.status.length > 0) {
            filtered = filtered.filter(cargo => filters.status!.includes(cargo.status));
        }

        if (filters.cityFrom) {
            filtered = filtered.filter(cargo => 
                cargo.address?.city.toLowerCase().includes(filters.cityFrom!.toLowerCase())
            );
        }

        if (filters.cityTo) {
            filtered = filtered.filter(cargo => 
                cargo.destiny?.city.toLowerCase().includes(filters.cityTo!.toLowerCase())
            );
        }

        if (filters.priceMin !== undefined) {
            filtered = filtered.filter(cargo => cargo.price >= filters.priceMin!);
        }

        if (filters.priceMax !== undefined) {
            filtered = filtered.filter(cargo => cargo.price <= filters.priceMax!);
        }

        if (filters.dateFrom) {
            filtered = filtered.filter(cargo => {
                const cargoDate = new Date(cargo.address?.date || '');
                const filterDate = new Date(filters.dateFrom!);
                return cargoDate >= filterDate;
            });
        }

        if (filters.dateTo) {
            filtered = filtered.filter(cargo => {
                const cargoDate = new Date(cargo.destiny?.date || '');
                const filterDate = new Date(filters.dateTo!);
                return cargoDate <= filterDate;
            });
        }

        return filtered;
    }, [cargos, searchQuery, filters]);

    // ======================
    // SOCKET ОБРАБОТЧИКИ
    // ======================

    useEffect(() => {
        const socket = socketService.getSocket();
        if (!socket) return;

        const handleCargoUpdated = (updatedCargo: CargoInfo) => {
            console.log('Cargo updated via socket:', updatedCargo);
            
            const currentCargos = Store.getState().cargos || [];
            const updatedCargos = currentCargos.map((c: CargoInfo) => 
                c.guid === updatedCargo.guid ? updatedCargo : c
            );
            
            Store.dispatch({
                type: 'SET_CARGOS',
                payload: updatedCargos
            });
        };

        const handleNewOffer = (data: { cargoId: string; offer: any }) => {
            console.log('New offer received:', data);
            
            const currentCargos = Store.getState().cargos || [];
            const updatedCargos = currentCargos.map((c: CargoInfo) => {
                if (c.guid === data.cargoId) {
                    const updatedInvoices = [...(c.invoices || []), data.offer];
                    return {
                        ...c,
                        invoices: updatedInvoices,
                        status: CargoStatus.HAS_ORDERS
                    };
                }
                return c;
            });
            
            Store.dispatch({
                type: 'SET_CARGOS',
                payload: updatedCargos
            });
        };

        const handlePublish = () => {
            console.log('Cargo published successfully');
        };

        // Подписываемся на события
        socket.on(SOCKET_EVENTS.SAVE_CARGO, handleCargoUpdated);
        socket.on(SOCKET_EVENTS.NEW_OFFER, handleNewOffer);
        socket.on('publish', handlePublish);

        return () => {
            socket.off(SOCKET_EVENTS.SAVE_CARGO, handleCargoUpdated);
            socket.off(SOCKET_EVENTS.NEW_OFFER, handleNewOffer);
            socket.off('publish', handlePublish);
        };
    }, []);

    // ======================
    // ВОЗВРАТ ИНТЕРФЕЙСА
    // ======================

    return {
        // Состояние
        cargos: filteredCargos(),
        isLoading,

        // CRUD операции
        createCargo,
        updateCargo,
        deleteCargo,
        publishCargo,

        // Навигация
        currentPage,
        navigateTo,
        goBack,

        // Фильтрация и поиск
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,

        // Утилиты
        getCargo,
        refreshCargos
    };
    
};