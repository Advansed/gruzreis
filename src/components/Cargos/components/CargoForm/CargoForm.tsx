import React, { useEffect, useRef } from 'react';
import { IonInput, IonTextarea, IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline, saveOutline } from 'ionicons/icons';
import { CargoInfo } from '../../types';
import { useCargoFormWizard } from './useCargoForm';
import styles from './CargoForm.module.css';
import { AddressSuggestions } from 'react-dadata';
import '../../../../../node_modules/react-dadata/dist/react-dadata.css'
import { Step5 } from './Step5';
import { useProfile } from '../../../Profile/hooks/useProfile';
import { useHistory } from 'react-router';
import { useStoreField } from '../../../Store';
import { calculateCompanyCompletion } from '../../../utils';

interface CargoFormProps {
  cargo?: CargoInfo;
  onBack: () => void;
  onSave?: (data: CargoInfo) => Promise<void>;
}

export const CargoForm: React.FC<CargoFormProps> = ({ cargo, onBack, onSave }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const companyData   = useStoreField('company',    21)

  const companyCompletion = calculateCompanyCompletion(companyData)

  const isCompanyIncomplete = companyCompletion < 70;
   
  const hist = useHistory()

  const {
      formState,
      currentStep,
      setCurrentStep,
      validateCurrentStep,
      setFieldValue,
      setNestedValue,
      getFieldError,
      initializeForm,
      saveToServer
  } = useCargoFormWizard();

  const { data, isSubmitting } = formState;


  // Инициализация формы при монтировании
  useEffect(() => {
    initializeForm(cargo);
  }, [cargo, initializeForm]);

  // ======================
  // НАВИГАЦИЯ
  // ======================
  
  const handleBackNavigation = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      scrollToTop();
    } else {
      onBack();
    }
  };

  const handleForwardNavigation = () => {
    if (isCompanyIncomplete) {
      console.log('currentStep', 0)
      setCurrentStep( 0 )
    } else
    if (currentStep < 7) {
      if (validateCurrentStep()) {
        setCurrentStep(currentStep + 1);
        scrollToTop();
      }
    } else {
      // Последний шаг - сохранение
      handleSave();
    }
  };

  const scrollToTop = () => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // ======================
  // СОХРАНЕНИЕ
  // ======================
  
  const handleSave = async () => {
      console.log("save")
    if (validateCurrentStep()) {
      console.log("save")
      const success = await saveToServer( data );
      if (success) {
        onBack(); // Возврат к списку после успешного сохранения
      }
    }
  };

  // ======================
  // ЗАГОЛОВКИ ШАГОВ
  // ======================
  
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Название и описание';
      case 2: return 'Информация о клиенте';
      case 3: return 'Место погрузки';
      case 4: return 'Сроки перевозки';
      case 5: return 'Характеристики груза';
      case 6: return 'Контактная Информация';
      case 7: return 'Создание заказа';
      default: return '';
    }
  };

  // Добавить рендер предупреждения о компании
  const renderCompanyWarning = () => {
    if (!isCompanyIncomplete) return null;
    
    return (
      <div className={styles.companyWarning}>
        <div className={styles.warningIcon}>⚠️</div>
        <div className={styles.warningText}>
          <div className={styles.warningTitle}>Заполните данные компании</div>
          <div className={styles.warningSubtitle}>
            Для создания груза необходимо полностью заполнить информацию о компании в профиле
          </div>
        </div>
        <button 
          className={styles.profileButton}
          onClick={() => {
            // Переход в профиль/компанию - добавить логику навигации
            hist.push("/tab3")
          }}
        >
          Перейти в профиль
        </button>
      </div>
    );
  };

  const renderStepHeader = () => (
    <div className={styles.stepHeader} data-step={currentStep}>
      <button 
        className={`${styles.navButton} ${styles.navButtonLeft}`} 
        onClick={handleBackNavigation}
      >
        <IonIcon icon={chevronBackOutline} />
      </button>
      
      <h3 className={styles.stepTitle}>{getStepTitle()}</h3>
      
      <button 
        className={`${styles.navButton} ${styles.navButtonRight}`} 
        onClick={handleForwardNavigation}
        disabled={isSubmitting}
      >
        {currentStep === 7 ? (
          <IonIcon icon={saveOutline} />
        ) : (
          <IonIcon icon={chevronForwardOutline} />
        )}
      </button>
    </div>
  );

  // ======================
  // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
  // ======================
  
  const renderFieldError = (fieldPath: string) => {
    const error = getFieldError(fieldPath);
    if (error) {
      return <div className={styles.errorMsg}>{error}</div>;
    }
    return null;
  };

  function Address ( props:{ fias: string } ) {

      return <>
        <AddressSuggestions 
            filterLocations={[{ fias_id: props.fias }]}
            filterRestrictValue
            token="50bfb3453a528d091723900fdae5ca5a30369832" 
            value={{ value: data.address?.address || ''} as any } 
            onChange={(suggestion) => {
                setNestedValue('address', 'address',  suggestion?.value || '' )
                setNestedValue('address', 'fias',     suggestion?.data.fias_id || '' )
                setNestedValue('address', 'lat',      suggestion?.data.geo_lat || 0 )
                setNestedValue('address', 'long',     suggestion?.data.geo_lon || 0 )
            }} 
        />
      </>
  }

  function Destiny ( props:{ fias: string } ) {

      return <>
        <AddressSuggestions 
            filterLocations={[{ fias_id: props.fias }]}
            filterRestrictValue
            token="50bfb3453a528d091723900fdae5ca5a30369832" 
            value={{ value: data.destiny?.address || ''} as any } 
            onChange={(suggestion) => {
                setNestedValue('destiny', 'address',  suggestion?.value || '' )
                setNestedValue('destiny', 'fias',     suggestion?.data.fias_id || '' )
                setNestedValue('destiny', 'lat',      suggestion?.data.geo_lat || 0 )
                setNestedValue('destiny', 'long',     suggestion?.data.geo_lon || 0 )
            }} 
        />
      </>
  }

  // ======================
  // ШАГИ ФОРМЫ
  // ======================
  
  // Шаг 1: Название и описание
  const renderStep1 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Название груза</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.name}
            placeholder="Введите название груза..."
            onIonInput={(e) => setFieldValue('name', e.detail.value as string)}
          />
        </div>
        {renderFieldError('name')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Описание груза</div>
        <div className={styles.inputWrapper}>
          <IonTextarea 
            className={styles.customTextarea}
            value={data.description}
            placeholder="Описание груза, особенности перевозки..."
            rows={4}
            onIonInput={(e) => setFieldValue('description', e.detail.value as string)}
          />
        </div>
        {renderFieldError('description')}
      </div>
    </div>
  );

  // Шаг 2: Место погрузки
  const renderStep2 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Город погрузки</div>

        <AddressSuggestions 
            filterLocations={[]}
            filterFromBound='city'
            filterToBound='city'
            filterRestrictValue
            token="50bfb3453a528d091723900fdae5ca5a30369832" 
            value={ { value: data.address?.city.city } as any } 
            onChange={ (suggestion) => setNestedValue('address', 'city', { city: suggestion?.value, fias: suggestion?.data.city_fias_id } ) } 
        />

        {renderFieldError('address.city.city')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Адрес погрузки</div>

        <Address fias = { data.address?.city.fias } />

        {renderFieldError('address.address')}
      </div>
    </div>
  );

  // Шаг 3: Место разгрузки
  const renderStep3 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Город разгрузки</div>
        
        <AddressSuggestions 
            filterLocations={[]}
            filterFromBound='city'
            filterToBound='city'
            filterRestrictValue
            token="50bfb3453a528d091723900fdae5ca5a30369832" 
            value={ { value: data.destiny?.city.city } as any } 
            onChange={ (suggestion) => setNestedValue('destiny', 'city', { city: suggestion?.value, fias: suggestion?.data.city_fias_id } ) } 
        />

        {renderFieldError('destiny.city.city')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Адрес разгрузки</div>

        <Destiny fias = { data.destiny?.city.fias } />

        {renderFieldError('destiny.address')}
      </div>
    </div>
  );

  // Шаг 4: Сроки перевозки
  const renderStep4 = () => (
    <div className={styles.stepContent}>
      
      <div className={styles.field}>
        <div className={styles.label}>Дата погрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="date"
            value = { data.pickup_date || ''}
            onIonInput={(e) => setFieldValue( 'pickup_date', e.detail.value as string )}
          />
        </div>
        {renderFieldError('address.date')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Дата разгрузки</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="date"
            value={data.delivery_date || ''}
            onIonInput={(e) => setFieldValue( 'delivery_date', e.detail.value as string )}
          />
        </div>
        {renderFieldError('destiny.date')}
      </div>

    </div>
  );

  // Шаг 5: Характеристики груза
  const renderStep5 = () => {

    return (
      <Step5
        data={data}
        setFieldValue={setFieldValue}
        getFieldError={getFieldError}
      />
    );

  };

  // Шаг 6: Контакты и итоговая информация
  const renderStep6 = () => (
    <div className={styles.stepContent}>
      <div className={styles.field}>
        <div className={styles.label}>Телефон</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            type="tel"
            value={data.phone}
            placeholder="+7 (xxx) xxx-xx-xx"
            onIonInput={(e) => setFieldValue('phone', e.detail.value as string)}
          />
        </div>
        {renderFieldError('phone')}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>Контактное лицо</div>
        <div className={styles.inputWrapper}>
          <IonInput 
            className={styles.customInput}
            value={data.face}
            placeholder="ФИО контактного лица..."
            onIonInput={(e) => setFieldValue('face', e.detail.value as string)}
          />
        </div>
        {renderFieldError('face')}
      </div>

    </div>
  );

  // Шаг 7: Контакты и итоговая информация
  const renderStep7 = () => (
    <div className={styles.stepContent}>

      {/* Итоговая информация */}
      <div className={styles.summarySection}>
        <div className={styles.sectionTitle}>Проверьте данные перед сохранением</div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span>Груз:</span>
            <span>{data.name || 'Не указано'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Клиент:</span>
            <span>{data.client || 'Не указан'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Маршрут:</span>
            <span>{data.address?.city.city || 'Не указан'} → {data.destiny?.city.city || 'Не указан'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Характеристики:</span>
            <span>{data.weight}т, {data.volume}м³</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Цена:</span>
            <span>{data.price} руб</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Контакт:</span>
            <span>{data.face || 'Не указан'}</span>
          </div>
        </div>
      </div>
    </div>
  );
  // ======================
  // РЕНДЕР
  // ======================
  
  return (
    <div className={styles.cargoFormWizard}>
      <div className={styles.wizardContent} ref={scrollRef}>
        <div className={styles.stepContainer}>

          { renderStepHeader() }
          
          { renderCompanyWarning() }

          {!isCompanyIncomplete && currentStep === 1 && renderStep1()}
          {!isCompanyIncomplete && currentStep === 2 && renderStep2()}
          {!isCompanyIncomplete && currentStep === 3 && renderStep3()}
          {!isCompanyIncomplete && currentStep === 4 && renderStep4()}
          {!isCompanyIncomplete && currentStep === 5 && renderStep5()}
          {!isCompanyIncomplete && currentStep === 6 && renderStep6()}
          {!isCompanyIncomplete && currentStep === 7 && renderStep7()}

        </div>
      </div>
    </div>
  );
};