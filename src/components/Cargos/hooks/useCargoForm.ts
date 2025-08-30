/**
 * Хук для работы с формой груза
 */

import { useState, useCallback, useEffect } from 'react';
import { CargoInfo, FormState, ValidationErrors, UseCargoFormReturn, ValidationResult } from '../types';
import { EMPTY_CARGO } from '../constants';
import { validateField, validateForm, dataUtils } from '../utils';

export const useCargoForm = (initialMode: 'create' | 'edit' = 'create'): UseCargoFormReturn => {
    // Состояние
    const [mode, setMode] = useState<'create' | 'edit'>(initialMode);
    const [formState, setFormState] = useState<FormState>({
        data: { ...EMPTY_CARGO },
        errors: {},
        isValid: false,
        isSubmitting: false,
        isDirty: false
    });

    // Получение значения по пути в объекте
    const getValueByPath = useCallback((obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }, []);

    // Установка значения по пути в объекте
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

    // ======================
    // ВАЛИДАЦИЯ
    // ======================

    const validateFieldInternal = useCallback((fieldPath: string): string | null => {
        const value = getValueByPath(formState.data, fieldPath);
        return validateField(fieldPath, value, formState.data);
    }, [formState.data, getValueByPath]);

    const validateFormInternal = useCallback((): ValidationResult => {
        return validateForm(formState.data);
    }, [formState.data]);

    const updateFormValidation = useCallback((newData: CargoInfo) => {
        const validationResult = validateForm(newData);
        return {
            errors: validationResult.errors,
            isValid: validationResult.isValid
        };
    }, []);

    // ======================
    // ДЕЙСТВИЯ С ФОРМОЙ
    // ======================

    const setFieldValue = useCallback((fieldPath: string, value: any) => {
        setFormState(prev => {
            const newData = setValueByPath(prev.data, fieldPath, value);
            const validation = updateFormValidation(newData);
            
            return {
                ...prev,
                data: newData,
                errors: validation.errors,
                isValid: validation.isValid,
                isDirty: true
            };
        });
    }, [setValueByPath, updateFormValidation]);

    const setNestedValue = useCallback((parent: keyof CargoInfo, field: string, value: any) => {
        const fieldPath = `${parent}.${field}`;
        setFieldValue(fieldPath, value);
    }, [setFieldValue]);

    const resetForm = useCallback(() => {
        setFormState({
            data: { ...EMPTY_CARGO },
            errors: {},
            isValid: false,
            isSubmitting: false,
            isDirty: false
        });
    }, []);

    const initializeForm = useCallback((cargo?: CargoInfo) => {
        const initialData = cargo ? { ...cargo } : { ...EMPTY_CARGO };
        const validation = updateFormValidation(initialData);
        
        setFormState({
            data: initialData,
            errors: validation.errors,
            isValid: validation.isValid,
            isSubmitting: false,
            isDirty: false
        });

        // Устанавливаем режим в зависимости от наличия груза
        setMode(cargo ? 'edit' : 'create');
    }, [updateFormValidation]);

    const submitForm = useCallback(async (): Promise<boolean> => {
        // Валидируем форму перед отправкой
        const validationResult = validateFormInternal();
        const { errors, isValid } = validationResult;

        setFormState(prev => ({
            ...prev,
            errors,
            isValid,
            isSubmitting: true
        }));

        if (!isValid) {
            setFormState(prev => ({ ...prev, isSubmitting: false }));
            return false;
        }

        try {
            // Здесь будет вызов функции сохранения из useCargos
            // Пока возвращаем true как заглушку
            console.log('Submitting form:', formState.data);
            
            // Имитация отправки
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setFormState(prev => ({
                ...prev,
                isSubmitting: false,
                isDirty: false
            }));

            return true;

        } catch (error) {
            console.error('Error submitting form:', error);
            setFormState(prev => ({ ...prev, isSubmitting: false }));
            return false;
        }
    }, [formState.data, validateFormInternal]);

    // ======================
    // УТИЛИТЫ
    // ======================

    const hasErrors = useCallback((): boolean => {
        return Object.keys(formState.errors).length > 0;
    }, [formState.errors]);

    const getFieldError = useCallback((fieldPath: string): string | undefined => {
        return formState.errors[fieldPath];
    }, [formState.errors]);

    // ======================
    // ВОЗВРАТ ИНТЕРФЕЙСА
    // ======================

    return {
        // Состояние формы
        formState,

        // Действия
        actions: {
            setFieldValue,
            setNestedValue,
            resetForm,
            validateForm: validateFormInternal,
            submitForm
        },

        // Валидация
        validateField: validateFieldInternal,
        hasErrors,
        getFieldError,

        // Инициализация
        initializeForm,

        // Режимы
        mode,
        setMode
    };
};