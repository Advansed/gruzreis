// src/components/Cargos/Cargos.tsx

import React from 'react';
import { IonPage } from '@ionic/react';

import { useNavigation } from '../../hooks/useNavigation';
import CargoList from './CargoList';
// import CargoDetails from '../Cargo/CargoDetails';
// import CargoForm from '../Cargo/CargoForm';

// ============================================
// ТИПЫ
// ============================================

interface CargoData {
  guid: string;
  name: string;
  description: string;
  address: any;
  destiny: any;
  phone: string;
  face: string;
  weight: number;
  volume: number;
  price: number;
  cost: number;
  advance: number;
  pickup_date: string;
  delivery_date: string;
  status: string;
  invoices: any[];
}

// ============================================
// КОМПОНЕНТ CARGOS ROUTER
// ============================================

const Cargos: React.FC = () => {
  const { getCurrentLevel, getCurrentLevelData } = useNavigation();

  const currentLevel = getCurrentLevel();
  const levelData = getCurrentLevelData() as CargoData | null;

  // ============================================
  // РЕНДЕР ПО УРОВНЯМ
  // ============================================

  const renderContent = () => {
    switch (currentLevel) {
      case 'main':
        // Основной список грузов
        return <CargoList />;

      case 'details':
        // Детальный просмотр груза
        return (
          <div style={{ padding: '16px' }}>
            <h2>Детали груза</h2>
            {levelData ? (
              <div>
                <p><strong>Название:</strong> {levelData.name}</p>
                <p><strong>Описание:</strong> {levelData.description}</p>
                <p><strong>Статус:</strong> {levelData.status}</p>
                <p><strong>Вес:</strong> {levelData.weight} кг</p>
                <p><strong>Объем:</strong> {levelData.volume} м³</p>
                <p><strong>Цена:</strong> {levelData.price} ₽</p>
                <p><strong>Контакт:</strong> {levelData.face}</p>
                <p><strong>Телефон:</strong> {levelData.phone}</p>
                {levelData.invoices && levelData.invoices.length > 0 && (
                  <p><strong>Заказов:</strong> {levelData.invoices.length}</p>
                )}
              </div>
            ) : (
              <p>Данные груза не найдены</p>
            )}
          </div>
        );
        // TODO: Заменить на <CargoDetails cargo={levelData} />

      case 'create':
        // Создание нового груза
        return (
          <div style={{ padding: '16px' }}>
            <h2>Создание груза</h2>
            <p>Здесь будет форма создания груза</p>
          </div>
        );
        // TODO: Заменить на <CargoForm mode="create" />

      case 'edit':
        // Редактирование груза
        return (
          <div style={{ padding: '16px' }}>
            <h2>Редактирование груза</h2>
            {levelData ? (
              <div>
                <p>Редактирование: {levelData.name}</p>
                <p>GUID: {levelData.guid}</p>
              </div>
            ) : (
              <p>Данные груза для редактирования не найдены</p>
            )}
          </div>
        );
        // TODO: Заменить на <CargoForm mode="edit" cargo={levelData} />

      case 'form':
        // Универсальная форма (альтернативный подход)
        return (
          <div style={{ padding: '16px' }}>
            <h2>Форма груза</h2>
            {levelData ? (
              <p>Форма для: {levelData.name || 'Новый груз'}</p>
            ) : (
              <p>Форма нового груза</p>
            )}
          </div>
        );
        // TODO: Заменить на <CargoForm cargo={levelData} />

      case 'invoices':
        // Заказы по грузу
        return (
          <div style={{ padding: '16px' }}>
            <h2>Заказы по грузу</h2>
            {levelData ? (
              <div>
                <p>Груз: {levelData.name}</p>
                <p>Заказов: {levelData.invoices?.length || 0}</p>
                {levelData.invoices && levelData.invoices.length > 0 ? (
                  <div>
                    <h3>Список заказов:</h3>
                    {levelData.invoices.map((invoice: any, index: number) => (
                      <div key={index} style={{ 
                        border: '1px solid #ccc', 
                        padding: '8px', 
                        margin: '8px 0',
                        borderRadius: '4px'
                      }}>
                        <p><strong>Водитель:</strong> {invoice.driverName}</p>
                        <p><strong>Телефон:</strong> {invoice.driverPhone}</p>
                        <p><strong>Транспорт:</strong> {invoice.transport}</p>
                        <p><strong>Цена:</strong> {invoice.price} ₽</p>
                        <p><strong>Статус:</strong> {invoice.status}</p>
                        <p><strong>Рейтинг:</strong> {invoice.rating}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Заказов пока нет</p>
                )}
              </div>
            ) : (
              <p>Данные груза не найдены</p>
            )}
          </div>
        );
        // TODO: Заменить на <CargoInvoices cargo={levelData} />

      default:
        // Неизвестный уровень - возвращаемся к списку
        return <CargoList />;
    }
  };

  // ============================================
  // ОСНОВНОЙ РЕНДЕР
  // ============================================

  return (
    <IonPage>
      {renderContent()}
    </IonPage>
  );
};

export default Cargos;