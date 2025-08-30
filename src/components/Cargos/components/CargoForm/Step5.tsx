import React, { useState } from 'react';
import { IonInput, IonCheckbox } from '@ionic/react';
import { CargoInfo } from '../../types';
import styles from './CargoForm.module.css';

interface Step5Props {
  data: CargoInfo;
  setFieldValue: (fieldPath: string, value: any) => void;
  getFieldError: (fieldPath: string) => string | undefined;
}

export const Step5: React.FC<Step5Props> = ({ data, setFieldValue, getFieldError }) => {
  const [byWeight, setByWeight] = useState<boolean>(true);
  const [hasInsurance, setHasInsurance] = useState<boolean>((data.cost || 0) > 0);
  const [hasAdvance, setHasAdvance] = useState<boolean>((data.advance || 0) > 0);

  const handleToggle = (checked: boolean) => {
    setByWeight(checked);
    // Сбрасываем неактивное поле
    if (checked) {
      setFieldValue('volume', 0);
    } else {
      setFieldValue('weight', 0);
    }
  };

  const handleInsuranceToggle = (checked: boolean) => {
    setHasInsurance(checked);
    // Если выключили страховку - сбрасываем стоимость груза
    if (!checked) {
      setFieldValue('cost', 0);
    }
  };

  const handleAdvanceToggle = (checked: boolean) => {
    setHasAdvance(checked);
    // Если выключили предоплату - сбрасываем сумму
    if (!checked) {
      setFieldValue('advance', 0);
    }
  };

  return (
    <div className={styles.stepContent}>
      {/* Вес/Объем */}
      <div className={styles.field}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
            <IonCheckbox 
              checked={byWeight}
              onIonChange={(e) => handleToggle(e.detail.checked)}
            />
            <div className={styles.label} style={{margin: 0}}>
              {byWeight ? 'По весу' : 'По объему'}
            </div>
          </div>
          
          <div className={styles.inputWrapper} style={{flex: 1}}>
            <IonInput 
              className={styles.customInput}
              type="number"
              min="0"
              step="0.1"
              value={byWeight ? data.weight : data.volume}
              placeholder={byWeight ? 'Вес (тонн)' : 'Объем (м³)'}
              onIonInput={(e) => setFieldValue(byWeight ? 'weight' : 'volume', parseFloat(e.detail.value as string) || 0)}
            />
          </div>
        </div>
        {getFieldError(byWeight ? 'weight' : 'volume')}
      </div>

      {/* Цена */}
      <div className={styles.field}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
            <div className={styles.label}>Цена (руб)</div>
          </div>
          
          <div className={styles.inputWrapper} style={{flex: 1}}>
            <IonInput 
                className={styles.customInput}
                type="number"
                min="0"
                value={data.price}
                placeholder="0"
                onIonInput={(e) => setFieldValue('price', parseFloat(e.detail.value as string) || 0)}
            />
          </div>
        </div>
        {getFieldError('price')}
      </div>

      {/* Страхование */}
      <div className={styles.field}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
            <IonCheckbox 
              checked={hasInsurance}
              onIonChange={(e) => handleInsuranceToggle(e.detail.checked)}
            />
            <div className={styles.label} style={{margin: 0}}>
              Страхование
            </div>
          </div>
          
          {
            hasInsurance && (
            <div className={styles.inputWrapper} style={{flex: 1}}>
                <IonInput 
                className={styles.customInput}
                type="number"
                min="0"
                value={hasInsurance ? (data.cost || '') : ''}
                placeholder="Стоимость груза (руб)"
                disabled={!hasInsurance}
                onIonInput={(e) => setFieldValue('cost', parseFloat(e.detail.value as string) || 0)}
                />
            </div>
            )
          }
        </div>
        {getFieldError('cost')}
      </div>

      {/* Предоплата */}
      <div className={styles.field}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1em'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5em'}}>
            <IonCheckbox 
              checked={hasAdvance}
              onIonChange={(e) => handleAdvanceToggle(e.detail.checked)}
            />
            <div className={styles.label} style={{margin: 0}}>
              Предоплата
            </div>
          </div>
          
          {
            hasAdvance && (
                <div className={styles.inputWrapper} style={{flex: 1}}>
                    <IonInput 
                    className={styles.customInput}
                    type="number"
                    min="0"
                    value={hasAdvance ? (data.advance || '') : ''}
                    placeholder="Сумма предоплаты (руб)"
                    disabled={!hasAdvance}
                    onIonInput={(e) => setFieldValue('advance', parseFloat(e.detail.value as string) || 0)}
                    />
                </div>
            )
          }
        </div>
        {getFieldError('advance')}
      </div>

    </div>
  );
};