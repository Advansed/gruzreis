/**
 * Компонент списка грузов
 */

import React, { useState } from 'react';
import { 
    IonIcon, 
    IonInput, 
    IonButton,
    IonLabel,
    IonSelect,
    IonSelectOption,
    IonRefresher,
    IonRefresherContent,
    IonSpinner
} from '@ionic/react';
import { 
    filterOutline
} from 'ionicons/icons';
import { CargoInfo, CargoFilters, CargoStatus } from '../types';
import { CargoCard } from './CargoCard';
import { Package } from "lucide-react";

interface CargosListProps {
    cargos: CargoInfo[];
    isLoading?: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    filters: CargoFilters;
    onFiltersChange: (filters: CargoFilters) => void;
    onCreateNew: () => void;
    onCargoClick: (cargo: CargoInfo) => void;
    onRefresh?: () => Promise<void>;
}

export const CargosList: React.FC<CargosListProps> = ({
    cargos,
    isLoading = false,
    searchQuery,
    onSearchChange,
    filters,
    onFiltersChange,
    onCreateNew,
    onCargoClick,
    onRefresh
}) => {
    const [showFilters, setShowFilters] = useState(false);

    const handleRefresh = async (event: any) => {
        if (onRefresh) {
            await onRefresh();
        }
        event.detail.complete();
    };

    const handleStatusFilterChange = (statuses: CargoStatus[]) => {
        onFiltersChange({
            ...filters,
            status: statuses.length > 0 ? statuses : undefined
        });
    };

    const clearFilters = () => {
        onFiltersChange({});
        onSearchChange('');
    };

    const hasActiveFilters = () => {
        return searchQuery || 
               filters.status?.length || 
               filters.cityFrom || 
               filters.cityTo || 
               filters.priceMin || 
               filters.priceMax;
    };

    const renderEmptyState = () => (
        <div className="cr-card mt-1 text-center">
            <div className="fs-09 cl-gray mb-1">
                {hasActiveFilters() ? 'Грузы не найдены' : 'У вас пока нет грузов'}
            </div>
            {!hasActiveFilters() && (
                <div className="fs-08 cl-gray">
                    Создайте первый груз для перевозки
                </div>
            )}
        </div>
    );

    const renderLoadingState = () => (
        <div className="cr-card mt-1 text-center">
            <IonSpinner />
            <div className="fs-08 cl-gray mt-05">Загрузка грузов...</div>
        </div>
    );

    return (
        <>
            {/* Refresher */}
            {onRefresh && (
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
            )}

            {/* Header */}
            <div className="ml-05 mt-1 a-center fs-09">
                <b>Мои заказы</b>
                {cargos.length > 0 && (
                    <span className="ml-1 fs-08 cl-gray">({cargos.length})</span>
                )}
            </div>

            {/* Кнопка создания нового груза */}
            <div className="mb-4 ml-1 mr-1 mt-1">
                <div 
                    className="gradient-button"
                    onClick={onCreateNew}
                >
                    <Package className="w-6 h-6" />
                <span className="ml-3 font-semibold">Создать новый груз</span>
                </div>
            </div>

            {/* Поиск */}
            <div className="cr-card mt-1">
                <div className="flex">
                    <div className="flex-1">
                        <IonInput
                            value={searchQuery}
                            placeholder="Поиск по названию или городу..."
                            onIonInput={(e) => onSearchChange(e.detail.value as string)}
                            className="custom-input"
                        />
                    </div>
                    <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => setShowFilters(!showFilters)}
                        color={hasActiveFilters() ? 'primary' : 'medium'}
                    >
                        <IonIcon icon={filterOutline} />
                    </IonButton>
                </div>
            </div>

            {/* Фильтры */}
            {showFilters && (
                <div className="cr-card mt-1">
                    <div className="fs-09 mb-1"><b>Фильтры</b></div>
                    
                    {/* Фильтр по статусу */}
                    <div className="mb-1">
                        <div className="fs-08 mb-05">Статус</div>
                        <IonSelect
                            value={filters.status}
                            placeholder="Выберите статусы..."
                            multiple={true}
                            onIonChange={(e) => handleStatusFilterChange(e.detail.value)}
                        >
                            {Object.values(CargoStatus).map(status => (
                                <IonSelectOption key={status} value={status}>
                                    {status}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </div>

                    {/* Фильтр по городам */}
                    <div className="flex mb-1">
                        <div className="w-50">
                            <div className="fs-08 mb-05">Откуда</div>
                            <IonInput
                                value={filters.cityFrom}
                                placeholder="Город отправления..."
                                onIonInput={(e) => onFiltersChange({
                                    ...filters,
                                    cityFrom: e.detail.value as string
                                })}
                                className="custom-input"
                            />
                        </div>
                        <div className="w-50 ml-1">
                            <div className="fs-08 mb-05">Куда</div>
                            <IonInput
                                value={filters.cityTo}
                                placeholder="Город назначения..."
                                onIonInput={(e) => onFiltersChange({
                                    ...filters,
                                    cityTo: e.detail.value as string
                                })}
                                className="custom-input"
                            />
                        </div>
                    </div>

                    {/* Фильтр по цене */}
                    <div className="flex mb-1">
                        <div className="w-50">
                            <div className="fs-08 mb-05">Цена от</div>
                            <IonInput
                                value={filters.priceMin}
                                type="number"
                                placeholder="0"
                                onIonInput={(e) => onFiltersChange({
                                    ...filters,
                                    priceMin: parseInt(e.detail.value as string) || undefined
                                })}
                                className="custom-input"
                            />
                        </div>
                        <div className="w-50 ml-1">
                            <div className="fs-08 mb-05">Цена до</div>
                            <IonInput
                                value={filters.priceMax}
                                type="number"
                                placeholder="1000000"
                                onIonInput={(e) => onFiltersChange({
                                    ...filters,
                                    priceMax: parseInt(e.detail.value as string) || undefined
                                })}
                                className="custom-input"
                            />
                        </div>
                    </div>

                    {/* Кнопки управления фильтрами */}
                    <div className="flex">
                        <IonButton
                            fill="clear"
                            size="small"
                            onClick={clearFilters}
                            disabled={!hasActiveFilters()}
                        >
                            <IonLabel>Очистить</IonLabel>
                        </IonButton>
                        <IonButton
                            fill="clear"
                            size="small"
                            onClick={() => setShowFilters(false)}
                        >
                            <IonLabel>Скрыть</IonLabel>
                        </IonButton>
                    </div>
                </div>
            )}

            {/* Активные фильтры */}
            {hasActiveFilters() && (
                <div className="cr-card mt-1">
                    <div className="fs-08 cl-gray mb-05">Активные фильтры:</div>
                    <div className="flex flex-wrap">
                        {searchQuery && (
                            <div className="cr-chip mr-05 mb-05">
                                Поиск: {searchQuery}
                            </div>
                        )}
                        {filters.status?.map(status => (
                            <div key={status} className="cr-chip mr-05 mb-05">
                                {status}
                            </div>
                        ))}
                        {filters.cityFrom && (
                            <div className="cr-chip mr-05 mb-05">
                                Откуда: {filters.cityFrom}
                            </div>
                        )}
                        {filters.cityTo && (
                            <div className="cr-chip mr-05 mb-05">
                                Куда: {filters.cityTo}
                            </div>
                        )}
                        {filters.priceMin && (
                            <div className="cr-chip mr-05 mb-05">
                                От: {filters.priceMin}₽
                            </div>
                        )}
                        {filters.priceMax && (
                            <div className="cr-chip mr-05 mb-05">
                                До: {filters.priceMax}₽
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Список грузов */}
            {isLoading ? (
                renderLoadingState()
            ) : cargos.length === 0 ? (
                renderEmptyState()
            ) : (
                cargos.map((cargo) => (
                    <CargoCard
                        key={cargo.guid}
                        cargo={cargo}
                        mode="list"
                        onClick={() => onCargoClick(cargo)}
                    />
                ))
            )}
        </>
    );
};