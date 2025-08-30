import { useState, useCallback, useEffect } from 'react';
import { CargoInfo, ValidationErrors, FormState } from '../../types';
import { validateField, validateForm } from '../../utils';
import { EMPTY_CARGO } from '../../constants';
import socketService from '../../../Sockets';
import { Store } from '../../../Store';

// Типы для визарда
interface TouchedFields {
  [fieldPath: string]: boolean;
}

interface StepValidation {
  isValid: boolean;
  errors: ValidationErrors;
}

interface UseCargoFormWizardReturn {

  // Состояние формы
  formState: FormState;
  touchedFields: TouchedFields;
  currentStep: number;
  
  // Навигация по шагам
  setCurrentStep: (step: number) => void;
  canGoToStep: (step: number) => boolean;
  validateCurrentStep: () => boolean;
  
  // Работа с полями
  setFieldValue: (fieldPath: string, value: any) => void;
  setNestedValue: (parent: keyof CargoInfo, field: string, value: any) => void;
  markFieldAsTouched: (fieldPath: string) => void;
  getFieldError: (fieldPath: string) => string | undefined;
  isFieldTouched: (fieldPath: string) => boolean;
  
  // Общие действия
  resetForm: () => void;
  initializeForm: (cargo?: CargoInfo) => void;
  submitForm: () => Promise<boolean>;
  saveToServer: (cargoData: CargoInfo) => Promise<boolean>;
  
  // Режимы
  mode: 'create' | 'edit';
  setMode: (mode: 'create' | 'edit') => void;
}

// Поля по шагам
const STEP_FIELDS = {
  1: [ 'name', 'description' ],
  2: [ 'address.address' ],
  3: [ 'destiny.address' ],
  4: [ 'pickup_date', 'delivery_date' ],
  5: [ 'weight', 'price', 'cost' ],
  6: [ 'phone', 'face'],
  7: [ ]
};

export const useCargoFormWizard = (): UseCargoFormWizardReturn => {

  
  const [formState, setFormState] = useState<FormState>({
    data: { ...EMPTY_CARGO },
    errors: {},
    isValid: false,
    isSubmitting: false,
    isDirty: false
  });
  
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mode, setMode] = useState<'create' | 'edit'>('create');


  useEffect(()=>{
    console.log( formState.data.address )
  },[formState.data.address ])
  
  const getValueByPath = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }, []);

  const setValueByPath = useCallback((obj: any, path: string, value: any): any => {
    const keys = path.split('.');
    const result = { ...obj };
    
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      } else {
        current[key] = { ...current[key] };
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return result;
  }, []);

  
  // ВАЛИДАЦИЯ ПО ШАГАМ
  
  const validateStep = useCallback((step: number): StepValidation => {
    const stepFields = STEP_FIELDS[step as keyof typeof STEP_FIELDS] || [];
    const errors: ValidationErrors = {};
    
    // Валидируем только поля текущего шага
    for (const fieldPath of stepFields) {
      const value = getValueByPath(formState.data, fieldPath);
      const error = validateField(fieldPath, value, formState.data);
      if (error) {
        errors[fieldPath] = error;
      }
    }
    
    // Кросс-валидация для шага 4 (города не должны совпадать)
    if (step === 4) {
      const cityFrom = formState.data.address?.city.city;
      const cityTo = formState.data.destiny?.city.city;
      if (cityFrom && cityTo && cityFrom.toLowerCase() === cityTo.toLowerCase()) {
        errors['destiny.city'] = 'Города погрузки и разгрузки не должны совпадать';
      }
    }
    
    // Кросс-валидация для шага 5 (даты)
    if (step === 5) {
      const dateFrom = formState.data.pickup_date;
      const dateTo = formState.data.delivery_date;
      if (dateFrom && dateTo) {
        const pickupDate = new Date(dateFrom);
        const deliveryDate = new Date(dateTo);
        if (pickupDate >= deliveryDate) {
          errors['destiny.date'] = 'Дата разгрузки должна быть позже даты погрузки';
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, [formState.data, getValueByPath]);

  const validateCurrentStep = useCallback((): boolean => {
    const validation = validateStep(currentStep);
    
    // Отмечаем все поля текущего шага как touched
    const stepFields = STEP_FIELDS[currentStep as keyof typeof STEP_FIELDS] || [];
    const newTouchedFields = { ...touchedFields };
    stepFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);
    
    // Обновляем ошибки только для touched полей
    setFormState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...validation.errors
      }
    }));
    
    return validation.isValid;
  }, [currentStep, touchedFields, formState.data, getValueByPath]);

  const canGoToStep = useCallback((step: number): boolean => {
    // Можем перейти на шаг, если все предыдущие валидны
    for (let i = 1; i < step; i++) {
      const validation = validateStep(i);
      if (!validation.isValid) {
        return false;
      }
    }
    return true;
  }, [validateStep]);

  
  // РАБОТА С ПОЛЯМИ
  
  const markFieldAsTouched = useCallback((fieldPath: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldPath]: true}));
  }, []);

  
  const setFieldValue = useCallback((fieldPath: string, value: any) => {
    
    markFieldAsTouched(fieldPath);
    
    setFormState(prev => {
      const newData = setValueByPath(prev.data, fieldPath, value);
      
      // Валидируем только если поле touched
      const fieldError = validateField(fieldPath, value, newData);
      const newErrors = { ...prev.errors };
      
      if (fieldError) {
        newErrors[fieldPath] = fieldError;
      } else {
        delete newErrors[fieldPath];
      }
      
      return {
        ...prev,
        data: newData,
        errors: newErrors,
        isDirty: true
      };
    });
  }, [setValueByPath, markFieldAsTouched]);

  const setNestedValue = useCallback((parent: keyof CargoInfo, field: string, value: any) => {
    const fieldPath = `${parent}.${field}`;
    setFieldValue(fieldPath, value);
  }, [setFieldValue]);

  const getFieldError = useCallback((fieldPath: string): string | undefined => {
    
    if (touchedFields[fieldPath]) {
      return formState.errors[fieldPath];
    }

    return undefined;

  }, [formState.errors, touchedFields]);

  
  
  const isFieldTouched = useCallback((fieldPath: string): boolean => {
    return touchedFields[fieldPath] || false;
  }, [touchedFields]);

  
  // СОХРАНЕНИЕ НА СЕРВЕР
  
  const saveToServer = useCallback(async (cargoData: CargoInfo): Promise<boolean> => {
    try {
      const socket = socketService.getSocket();
      if (!socket || !socket.connected) {
        console.error('Socket not connected');
        return false;
      }

      const token = Store.getState().login?.token;
      if (!token) {
        console.error('No auth token available');
        return false;
      }

      // Подготавливаем данные для отправки
      const payload = {
        ...cargoData,
        token
      };

      console.log('Saving cargo to server:', payload);

      // Отправляем данные на сервер
      socketService.emit('save_cargo', payload);

      return true;

    } catch (error) {
      console.error('Error saving cargo to server:', error);
      return false;
    }
  }, []);

  // ======================
  // ОБЩИЕ ДЕЙСТВИЯ
  // ======================
  
  const resetForm = useCallback(() => {
    setFormState({
      data: { ...EMPTY_CARGO },
      errors: {},
      isValid: false,
      isSubmitting: false,
      isDirty: false
    });
    setTouchedFields({});
    setCurrentStep(1);
  }, []);

  const initializeForm = useCallback((cargo?: CargoInfo) => {
    const initialData = cargo ? { ...cargo } : { ...EMPTY_CARGO };
    
    setFormState({
      data: initialData,
      errors: {},
      isValid: false,
      isSubmitting: false,
      isDirty: false
    });
    
    // Для режима редактирования помечаем все поля как touched
    if (cargo) {
      const allFields = Object.values(STEP_FIELDS).flat();
      const newTouchedFields: TouchedFields = {};
      allFields.forEach(field => {
        newTouchedFields[field] = true;
      });
      setTouchedFields(newTouchedFields);
      setMode('edit');
    } else {
      setTouchedFields({});
      setMode('create');
    }
    
    setCurrentStep(1);
  }, []);

  const submitForm = useCallback(async (): Promise<boolean> => {
    // Полная валидация всей формы
    const validation = validateForm(formState.data);
    
    // Отмечаем все поля как touched
    const allFields = Object.values(STEP_FIELDS).flat();
    const newTouchedFields: TouchedFields = {};
    allFields.forEach(field => {
      newTouchedFields[field] = true;
    });
    setTouchedFields(newTouchedFields);
    
    setFormState(prev => ({
      ...prev,
      errors: validation.errors,
      isValid: validation.isValid,
      isSubmitting: true
    }));

    if (!validation.isValid) {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      return false;
    }

    try {
      // Сохраняем на сервер
      const success = await saveToServer(formState.data);
      
      if (success) {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isDirty: false
        }));
        
        console.log('Cargo saved successfully');
        return true;
      } else {
        throw new Error('Server save failed');
      }

    } catch (error) {
      console.error('Error submitting cargo form:', error);
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      return false;
    }
  }, [formState.data, saveToServer]);

  // ======================
  // ВОЗВРАТ ИНТЕРФЕЙСА
  // ======================
  
  return {
    // Состояние формы
    formState,
    touchedFields,
    currentStep,
    
    // Навигация по шагам
    setCurrentStep,
    canGoToStep,
    validateCurrentStep,
    
    // Работа с полями
    setFieldValue,
    setNestedValue,
    markFieldAsTouched,
    getFieldError,
    isFieldTouched,
    
    // Общие действия
    resetForm,
    initializeForm,
    submitForm,
    saveToServer,
    
    // Режимы
    mode,
    setMode
  };
};