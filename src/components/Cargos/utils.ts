/**
 * Утилиты для модуля Cargos
 */

import { CargoInfo, CargoStatus, ValidationErrors, ValidationResult } from './types';
import { 
    FIELD_LIMITS, 
    VALIDATION_MESSAGES, 
    VALIDATION_PATTERNS,
    STATUS_CLASSES,
    STATUS_COLORS,
    STATUS_DESCRIPTIONS,
    EDITABLE_STATUSES,
    DELETABLE_STATUSES,
    PUBLISHABLE_STATUSES
} from './constants';

// ======================
// УТИЛИТЫ ВАЛИДАЦИИ
// ======================

// Получение значения по пути в объекте
const getValueByPath = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Базовые валидаторы
export const validators = {
    required: (value: any): string | null => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return VALIDATION_MESSAGES.required;
        }
        return null;
    },

    minLength: (value: string, min: number): string | null => {
        if (value && value.length < min) {
            return `Минимум ${min} символов`;
        }
        return null;
    },

    maxLength: (value: string, max: number): string | null => {
        if (value && value.length > max) {
            return `Максимум ${max} символов`;
        }
        return null;
    },

    min: (value: number, min: number): string | null => {
        if (value !== undefined && value < min) {
            return `Минимум ${min}`;
        }
        return null;
    },

    max: (value: number, max: number): string | null => {
        if (value !== undefined && value > max) {
            return `Максимум ${max}`;
        }
        return null;
    },

    pattern: (value: string, pattern: RegExp, message: string): string | null => {
        if (value && !pattern.test(value)) {
            return message;
        }
        return null;
    },

    phone: (value: string): string | null => {
        if (value && !VALIDATION_PATTERNS.phone.test(value)) {
            return VALIDATION_MESSAGES.phone;
        }
        return null;
    },

    cityName: (value: string): string | null => {
        if (value && !VALIDATION_PATTERNS.cityName.test(value)) {
            return 'Название города может содержать только буквы, пробелы и дефисы';
        }
        return null;
    }
};

// Валидация отдельного поля
export const validateField = (fieldPath: string, value: any, allData?: CargoInfo): string | null => {
    const limits = FIELD_LIMITS;

    switch (fieldPath) {
        case 'name':
            return validators.required(value) || 
                   validators.minLength(value, limits.name.min) ||
                   validators.maxLength(value, limits.name.max);

        case 'address.city':
        case 'destiny.city':
            return validators.required(value) ||
                   validators.minLength(value, limits.city.min) ||
                   validators.maxLength(value, limits.city.max) ||
                   validators.cityName(value);

        case 'address.date':
        case 'destiny.date':
            return validators.required(value);

        case 'weight':
            return validators.required(value) ||
                   validators.min(value, limits.weight.min) ||
                   validators.max(value, limits.weight.max);

        case 'volume':
            return validators.required(value) ||
                   validators.min(value, limits.volume.min) ||
                   validators.max(value, limits.volume.max);

        case 'price':
            return validators.required(value) ||
                   validators.min(value, limits.price.min) ||
                   validators.max(value, limits.price.max);

        case 'phone':
            return validators.required(value) || validators.phone(value);

        case 'face':
            return validators.required(value) ||
                   validators.minLength(value, limits.face.min) ||
                   validators.maxLength(value, limits.face.max);

        case 'description':
            return validators.maxLength(value, limits.description.max);

        case 'address.address':
        case 'destiny.address':
            return validators.maxLength(value, limits.address.max);

        default:
            return null;
    }
};

// Кросс-полевая валидация
export const validateCrossFields = (data: CargoInfo): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Проверка одинаковых городов
    if (data.address?.city && data.destiny?.city && 
        data.address.city.city.toLowerCase() === data.destiny.city.city.toLowerCase()) {
        errors['address.city'] = VALIDATION_MESSAGES.sameCities;
        errors['destiny.city'] = VALIDATION_MESSAGES.sameCities;
    }

    // Проверка дат
    if (data.pickup_date && data.delivery_date) {
        const pickupDate = new Date(data.pickup_date);
        const deliveryDate = new Date(data.delivery_date);
        
        if (pickupDate >= deliveryDate) {
            errors['destiny.date'] = VALIDATION_MESSAGES.dateOrder;
        }
    }

    return errors;
};

// Полная валидация формы
export const validateForm = (data: CargoInfo): ValidationResult => {
    const errors: ValidationErrors = {};

    // Валидация отдельных полей
    const requiredFields = [
        'name', 'address.city', 'destiny.city', 'address.date', 'destiny.date',
        'weight', 'volume', 'price', 'phone', 'face'
    ];

    for (const fieldPath of requiredFields) {
        const value = getValueByPath(data, fieldPath);
        const error = validateField(fieldPath, value, data);
        if (error) {
            errors[fieldPath] = error;
        }
    }

    // Кросс-полевая валидация
    const crossErrors = validateCrossFields(data);
    Object.assign(errors, crossErrors);

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// ======================
// УТИЛИТЫ ФОРМАТИРОВАНИЯ
// ======================

export const formatters = {
    // Форматирование валюты
    currency: (amount: number): string => {
        try {
            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } catch {
            return `${amount} ₽`;
        }
    },

    // Форматирование веса
    weight: (weight: number, weight1 = 0): string => {
        const totalWeight = Math.max(0, weight - weight1);
        return `${totalWeight.toFixed(1)} тонн`;
    },

    // Форматирование объема
    volume: (volume: number): string => {
        return `${volume.toFixed(1)} м³`;
    },

    // Форматирование даты
    date: (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    },

    // Форматирование для input[type="date"]
    dateInput: (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return '';
        }
    },

    // Форматирование телефона
    phone: (phone: string): string => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        
        if (digits.length === 11 && digits.startsWith('7')) {
            return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
        }
        
        if (digits.length === 10) {
            return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8)}`;
        }
        
        return phone;
    },

    // Короткий ID
    shortId: (guid: string): string => {
        return guid ? guid.substring(0, 6).toUpperCase() : '';
    },

    // Маршрут
    route: (fromCity: string, toCity: string): string => {
        if (!fromCity || !toCity) return '';
        return `${fromCity} → ${toCity}`;
    },

    // Адрес
    address: (city: string, address?: string): string => {
        if (!city) return '';
        if (!address || address.trim() === '') return city;
        return `${city}, ${address}`;
    },

    // Относительная дата
    relativeDate: (dateString: string): string => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const inputDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            
            const diffTime = inputDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === -1) return 'вчера';
            if (diffDays === 0) return 'сегодня';
            if (diffDays === 1) return 'завтра';
            
            return formatters.date(dateString);
        } catch {
            return dateString;
        }
    }
};

// ======================
// УТИЛИТЫ СТАТУСОВ
// ======================

export const statusUtils = {
    // Получение CSS класса статуса
    getClassName: (status: CargoStatus): string => {
        return STATUS_CLASSES[status] || 'cr-status-1';
    },

    // Получение цвета статуса
    getColor: (status: CargoStatus): string => {
        return STATUS_COLORS[status] || '#1976d2';
    },

    // Получение описания статуса
    getDescription: (status: CargoStatus): string => {
        return STATUS_DESCRIPTIONS[status] || '';
    },

    // Проверка возможности редактирования
    canEdit: (status: CargoStatus): boolean => {
        return EDITABLE_STATUSES.includes(status);
    },

    // Проверка возможности удаления
    canDelete: (status: CargoStatus): boolean => {
        return DELETABLE_STATUSES.includes(status);
    },

    // Проверка возможности публикации
    canPublish: (status: CargoStatus): boolean => {
        return PUBLISHABLE_STATUSES.includes(status);
    },

    // Получение следующего статуса
    getNextStatus: (currentStatus: CargoStatus): CargoStatus | null => {
        switch (currentStatus) {
            case CargoStatus.NEW:               return CargoStatus.WAITING;
            case CargoStatus.WAITING:           return CargoStatus.HAS_ORDERS;
            case CargoStatus.HAS_ORDERS:        return CargoStatus.IN_WORK;
            case CargoStatus.NEGOTIATION:       return CargoStatus.IN_WORK;
            case CargoStatus.IN_WORK:           return CargoStatus.DELIVERED;
            case CargoStatus.DELIVERED:         return CargoStatus.COMPLETED;
            default:                            return null;
        }
    },

    // Получение прогресса в процентах
    getProgress: (status: CargoStatus): number => {
        const progressMap = {
            [ CargoStatus.NEW ]:            0,
            [ CargoStatus.WAITING ]:        20,
            [ CargoStatus.HAS_ORDERS ]:     40,
            [ CargoStatus.NEGOTIATION ]:    50,
            [ CargoStatus.IN_WORK ]:        70,
            [ CargoStatus.DELIVERED ]:      90,
            [ CargoStatus.COMPLETED ]:      100
        };
        return progressMap[status] || 0;
    }
};

// ======================
// УТИЛИТЫ ДАННЫХ
// ======================

export const dataUtils = {
    // Создание пустого груза
    createEmptyCargo: (): CargoInfo => ({

        guid:               "",
        name:               "",
        description:        "",
        client:             "",
        address:            { city: { city: "", fias: ""}, address: "", fias: "", long: 0, lat: 0 },
        destiny:            { city: { city: "", fias: ""}, address: "", fias: "", long: 0, lat: 0 },
        weight:             0,
        weight1:            0,
        volume:             0,
        price:              0,
        cost:               0,
        advance:            0,
        pickup_date:        "",
        delivery_date:      "",
        phone:              "",
        face:               "",
        status:             CargoStatus.NEW

    }),

    // Генерация GUID
    generateGuid: (): string => {

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

    },

    // Парсинг числа из строки
    parseNumber: (value: string | number): number => {

        if (typeof value === 'number') return value;
        const parsed = parseFloat(value.replace(/[^\d.]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    },

    // Очистка телефона до цифр
    cleanPhone: (phone: string): string => {

        return phone.replace(/\D/g, '');

    },

    // Проверка заполненности груза
    isCargoComplete: (cargo: CargoInfo): boolean => {

        return Boolean(
            cargo.name &&
            cargo.address?.city &&
            cargo.destiny?.city &&
            cargo.pickup_date &&
            cargo.delivery_date &&
            cargo.weight > 0 &&
            cargo.volume > 0 &&
            cargo.price > 0 &&
            cargo.phone &&
            cargo.face
        );

    }
};

// ======================
// ЭКСПОРТ ОСНОВНЫХ УТИЛИТ
// ======================

export default {
    validate: {
        field: validateField,
        form: validateForm,
        crossFields: validateCrossFields,
        validators
    },
    format: formatters,
    status: statusUtils,
    data: dataUtils
};
