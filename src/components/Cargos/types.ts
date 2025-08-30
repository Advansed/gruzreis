/**
 * Основные типы для модуля Cargos
 */

// Статусы груза
export enum CargoStatus {
    NEW = "Новый",
    WAITING = "В ожидании",
    HAS_ORDERS = "Есть заказы",
    NEGOTIATION = "Торг",
    IN_WORK = "В работе",
    DELIVERED = "Доставлено",
    COMPLETED = "Выполнено"
}

// Приоритет груза
export enum CargoPriority {
    LOW = "Низкий",
    NORMAL = "Обычный",
    HIGH = "Высокий",
    URGENT = "Срочный"
}

export interface CargoCity {
    city:       string,
    fias:       string
}

// Адрес (отправления или назначения)
export interface CargoAddress {
    city:       CargoCity;
    address:    string;
    fias:       string;
    lat:        number;
    long:       number;
}

// Предложение от водителя
export interface CargoInvoice {
    id:                 string;
    cargo:              string;
    driverId:           string;
    driverName:         string;
    driverPhone:        string;
    transport:          string;
    price:              number;
    weight:             number;
    volume:             number;
    status:             string;
    createdAt:          string;
    rating:             number;
}

// Основная информация о грузе
export interface CargoInfo {

    guid:               string;
    name:               string;
    description:        string;
    client:             string;
    
    // Адреса
    address:            CargoAddress;
    destiny:            CargoAddress;

    //Даты
    pickup_date:        string;
    delivery_date:      string;

    // Характеристики груза
    weight:             number;
    weight1?:           number; // Для совместимости
    volume:             number;
    price:              number;
    cost:               number;
    advance:            number;
    
    // Контакты
    phone:              string;
    face:               string;
    
    // Статус и предложения
    status:             CargoStatus;
    invoices?:          CargoInvoice[];
    priority?:          CargoPriority;
    
    // Метаданные
    createdAt?:         string;
    updatedAt?:         string;
    
}

// Ошибки валидации
export interface ValidationErrors {
    [fieldPath: string]: string;
}

// Состояние формы
export interface FormState {
    data: CargoInfo;
    errors: ValidationErrors;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
}

// Типы страниц для навигации
export type PageType = 
    | { type: 'list' }
    | { type: 'create' }
    | { type: 'edit'; cargo: CargoInfo }
    | { type: 'view'; cargo: CargoInfo };

// Фильтры для списка грузов
export interface CargoFilters {
    status?: CargoStatus[];
    cityFrom?: string;
    cityTo?: string;
    priceMin?: number;
    priceMax?: number;
    dateFrom?: string;
    dateTo?: string;
}

// Параметры сортировки
export interface SortOptions {
    field: 'createdAt' | 'price' | 'weight' | 'status';
    direction: 'asc' | 'desc';
}

// Результат валидации
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrors;
}

// Действия с формой
export interface FormActions {
    setFieldValue: (fieldPath: string, value: any) => void;
    setNestedValue: (parent: keyof CargoInfo, field: string, value: any) => void;
    resetForm: () => void;
    validateForm: () => ValidationResult;
    submitForm: () => Promise<boolean>;
}

// Хук управления грузами
export interface UseCargosReturn {
    // Состояние
    cargos: CargoInfo[];
    isLoading: boolean;
    
    // CRUD операции
    createCargo: (data: Partial<CargoInfo>) => Promise<boolean>;
    updateCargo: (guid: string, data: Partial<CargoInfo>) => Promise<boolean>;
    deleteCargo: (guid: string) => Promise<boolean>;
    publishCargo: (guid: string) => Promise<boolean>;
    
    // Навигация
    currentPage: PageType;
    navigateTo: (page: PageType) => void;
    goBack: () => void;
    
    // Фильтрация и поиск
    filters: CargoFilters;
    setFilters: (filters: CargoFilters) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    
    // Утилиты
    getCargo: (guid: string) => CargoInfo | undefined;
    refreshCargos: () => Promise<void>;
}

// Хук формы
export interface UseCargoFormReturn {
    // Состояние формы
    formState: FormState;
    
    // Действия
    actions: FormActions;
    
    // Валидация
    validateField: (fieldPath: string) => string | null;
    hasErrors: () => boolean;
    getFieldError: (fieldPath: string) => string | undefined;
    
    // Инициализация
    initializeForm: (cargo?: CargoInfo) => void;
    
    // Режимы
    mode: 'create' | 'edit';
    setMode: (mode: 'create' | 'edit') => void;
}