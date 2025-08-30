// src/components/Cargo/CargoList.tsx

import React from 'react';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
  IonChip,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonText,
  IonToolbar,
  IonButtons
} from '@ionic/react';
import {
  addOutline,
  carOutline,
  callOutline,
  personOutline,
  scaleOutline,
  cubeOutline,
  cashOutline,
  calendarOutline,
  locationOutline,
  createOutline,
  shareOutline,
  listOutline
} from 'ionicons/icons';

import { useCargoList, CargoStatus, Cargo } from '../../hooks/useCargoList';
import { useNavigation } from '../../hooks/useNavigation';
import styles from './CargoList.module.css';

// ============================================
// КОМПОНЕНТ CARGOLIST
// ============================================

const CargoList: React.FC = () => {
  const {
    cargos,
    loading,
    error,
    filteredCargos,
    statusFilter,
    searchQuery,
    loadCargos,
    publishCargo,
    setStatusFilter,
    setSearchQuery,
    clearFilters,
    getStatusBadgeProps,
    formatAddress
  } = useCargoList();

  const { navigateInside } = useNavigation();

  // ============================================
  // ОБРАБОТЧИКИ СОБЫТИЙ
  // ============================================

  const handleRefresh = async (event: CustomEvent) => {
    await loadCargos();
    event.detail.complete();
  };

  const handleCreateCargo = () => {
    navigateInside('create');
  };

  const handleEditCargo = (cargo: Cargo) => {
    navigateInside('edit', cargo);
  };

  const handleViewCargo = (cargo: Cargo) => {
    navigateInside('details', cargo);
  };

  const handlePublishCargo = async (guid: string) => {
    await publishCargo(guid);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as CargoStatus);
  };

  // ============================================
  // РЕНДЕР КАРТОЧКИ ГРУЗА
  // ============================================

  const renderCargoCard = (cargo: Cargo) => {
    const statusProps = getStatusBadgeProps(cargo.status);
    const hasInvoices = cargo.invoices && cargo.invoices.length > 0;

    return (
      <IonCol key={cargo.guid} size="12" sizeMd="6" sizeLg="4">
        <IonCard className={styles.cargoCard}>
          
          {/* Заголовок карточки */}
          <IonCardHeader className={styles.cardHeader}>
            <div className={styles.cardTitleRow}>
              <IonCardTitle className={styles.cardTitle}>
                {cargo.name}
              </IonCardTitle>
              <IonBadge color={statusProps.color} className={styles.statusBadge}>
                <IonIcon icon={statusProps.icon} />
                <span>{cargo.status}</span>
              </IonBadge>
            </div>
          </IonCardHeader>

          {/* Контент карточки */}
          <IonCardContent className={styles.cardContent}>
            
            {/* Описание */}
            {cargo.description && (
              <IonText className={styles.description}>
                {cargo.description}
              </IonText>
            )}

            {/* Маршрут */}
            <div className={styles.route}>
              <IonItem lines="none" className={styles.routeItem}>
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel>
                  <p className={styles.routeLabel}>Откуда:</p>
                  <h3>{formatAddress(cargo.address)}</h3>
                </IonLabel>
              </IonItem>
              
              <IonItem lines="none" className={styles.routeItem}>
                <IonIcon icon={locationOutline} slot="start" color="secondary" />
                <IonLabel>
                  <p className={styles.routeLabel}>Куда:</p>
                  <h3>{formatAddress(cargo.destiny)}</h3>
                </IonLabel>
              </IonItem>
            </div>

            {/* Параметры груза */}
            <div className={styles.parameters}>
              <IonChip color="medium">
                <IonIcon icon={scaleOutline} />
                <IonLabel>{cargo.weight} кг</IonLabel>
              </IonChip>
              
              <IonChip color="medium">
                <IonIcon icon={cubeOutline} />
                <IonLabel>{cargo.volume} м³</IonLabel>
              </IonChip>
              
              <IonChip color="success">
                <IonIcon icon={cashOutline} />
                <IonLabel>{cargo.price} ₽</IonLabel>
              </IonChip>
            </div>

            {/* Контактная информация */}
            <div className={styles.contacts}>
              <IonItem lines="none" className={styles.contactItem}>
                <IonIcon icon={personOutline} slot="start" />
                <IonLabel>{cargo.face}</IonLabel>
              </IonItem>
              
              <IonItem lines="none" className={styles.contactItem}>
                <IonIcon icon={callOutline} slot="start" />
                <IonLabel>{cargo.phone}</IonLabel>
              </IonItem>
            </div>

            {/* Даты */}
            {(cargo.pickup_date || cargo.delivery_date) && (
              <div className={styles.dates}>
                {cargo.pickup_date && (
                  <IonChip color="tertiary">
                    <IonIcon icon={calendarOutline} />
                    <IonLabel>Забор: {cargo.pickup_date}</IonLabel>
                  </IonChip>
                )}
                
                {cargo.delivery_date && (
                  <IonChip color="tertiary">
                    <IonIcon icon={calendarOutline} />
                    <IonLabel>Доставка: {cargo.delivery_date}</IonLabel>
                  </IonChip>
                )}
              </div>
            )}

            {/* Информация о заказах */}
            {hasInvoices && (
              <div className={styles.invoices}>
                <IonText color="medium">
                  <p>Заказов: {cargo.invoices.length}</p>
                </IonText>
              </div>
            )}

            {/* Кнопки действий */}
            <div className={styles.actions}>
              <IonButton 
                fill="clear" 
                size="small"
                onClick={() => handleViewCargo(cargo)}
              >
                <IonIcon icon={listOutline} slot="start" />
                Детали
              </IonButton>
              
              <IonButton 
                fill="clear" 
                size="small"
                onClick={() => handleEditCargo(cargo)}
              >
                <IonIcon icon={createOutline} slot="start" />
                Изменить
              </IonButton>
              
              {cargo.status === 'Новый' && (
                <IonButton 
                  fill="clear" 
                  size="small"
                  color="success"
                  onClick={() => handlePublishCargo(cargo.guid)}
                >
                  <IonIcon icon={shareOutline} slot="start" />
                  Опубликовать
                </IonButton>
              )}
            </div>

          </IonCardContent>
        </IonCard>
      </IonCol>
    );
  };

  // ============================================
  // ОСНОВНОЙ РЕНДЕР
  // ============================================

  return (
    <IonContent className={styles.container}>
      
      {/* Refresher */}
      <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
        <IonRefresherContent />
      </IonRefresher>

      {/* Панель фильтров и поиска */}
      <div className={styles.filtersPanel}>
        
        {/* Поиск */}
        <IonSearchbar
          value={searchQuery}
          placeholder="Поиск по названию или описанию"
          onIonInput={(e) => setSearchQuery(e.detail.value!)}
          className={styles.searchbar}
        />

        {/* Фильтр по статусам */}
        <IonSegment 
          value={statusFilter} 
          onIonChange={(e) => handleStatusFilterChange(e.detail.value as string)}
          className={styles.statusSegment}
        >
          <IonSegmentButton value="Все">
            <IonLabel>Все</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="Новый">
            <IonLabel>Новые</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="Есть заказы">
            <IonLabel>Заказы</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="В работе">
            <IonLabel>В работе</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="Выполнено">
            <IonLabel>Готово</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Кнопка создания */}
        <div className={styles.headerActions}>
          <IonButton 
            expand="block"
            onClick={handleCreateCargo}
            className={styles.createButton}
          >
            <IonIcon icon={addOutline} slot="start" />
            Создать груз
          </IonButton>
        </div>

      </div>

      {/* Загрузка */}
      {loading && (
        <div className={styles.loadingContainer}>
          <IonSpinner name="crescent" />
          <IonText>Загрузка грузов...</IonText>
        </div>
      )}

      {/* Ошибка */}
      {error && !loading && (
        <div className={styles.errorContainer}>
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
          <IonButton fill="outline" onClick={() => loadCargos()}>
            Попробовать снова
          </IonButton>
        </div>
      )}

      {/* Список грузов */}
      {!loading && !error && (
        <IonGrid className={styles.cargoGrid}>
          <IonRow>
            {filteredCargos.length > 0 ? (
              filteredCargos.map(renderCargoCard)
            ) : (
              <IonCol size="12">
                <div className={styles.emptyState}>
                  <IonIcon icon={carOutline} className={styles.emptyIcon} />
                  <IonText>
                    <h2>Грузы не найдены</h2>
                    <p>
                      {searchQuery || statusFilter !== 'Все' 
                        ? 'Попробуйте изменить фильтры поиска'
                        : 'Создайте первый груз для перевозки'
                      }
                    </p>
                  </IonText>
                  <IonButton fill="outline" onClick={handleCreateCargo}>
                    <IonIcon icon={addOutline} slot="start" />
                    Создать груз
                  </IonButton>
                </div>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
      )}

    </IonContent>
  );
};

export default CargoList;