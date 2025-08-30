import React from 'react';
import { IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/react';
import { CargoCard } from '../components/CargoCard';
import useCargoArchive from '../hooks/useCargoArchive';
import './CargoArchive.css'

const CargoArchive = () => {
  const { cargos, loading, refreshing, refresh } = useCargoArchive();

  const handleRefresh = async (event: any) => {
    await refresh();
    event.detail.complete();
  };

  const handleCargoClick = (cargo) => {
    // TODO: Добавить навигацию к просмотру заказа
    console.log('Clicked cargo:', cargo);
  };

  if (loading) {
    return (
      <div className="cr-loading">
        <IonSpinner />
        <div>Загрузка архива...</div>
      </div>
    );
  }

  return (
    <div className="cr-container">
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent
          pullingIcon="chevron-down-outline"
          pullingText="Потяните для обновления"
          refreshingSpinner="circles"
          refreshingText="Обновление..."
        />
      </IonRefresher>

      <div className="cr-header">
        <div className="fs-09"><b>Архив заказов</b></div>
        <button 
          onClick={refresh} 
          disabled={refreshing}
          className={`cr-refresh-btn ${refreshing ? 'refreshing' : ''}`}
        >
          {refreshing ? '⟳' : '↻'} Обновить
        </button>
      </div>

      <div className="cr-stats">
        Завершенных заказов: {cargos.length}
      </div>

      <div className="cr-list">
        {cargos.length === 0 ? (
          <div className="cr-empty">
            <div className="cr-empty-icon">📦</div>
            <div className="cr-empty-text">Нет завершенных заказов</div>
          </div>
        ) : (
          cargos.map(cargo => (
            <CargoCard
              key={cargo.guid}
              cargo={cargo}
              onClick={() => handleCargoClick(cargo)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CargoArchive;