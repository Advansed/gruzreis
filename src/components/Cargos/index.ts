/**
 * Главный экспорт модуля Cargos
 */

// Стили (нужно импортировать в приложении)
import './styles.css';

// Основной компонент
export { Cargos } from './Cargos';

export { default as CargoArchive } from './components/CargoArchive';

// Основные типы для внешнего использования
export type { 
    CargoInfo, 
    CargoStatus, 
    CargoPriority,
    CargoAddress,
    CargoInvoice,
    PageType,
    CargoFilters,
    FormState,
    ValidationErrors
} from './types';

// Хуки для внешнего использования
export { 
    useCargos, 
    useCargoForm,
    useCargoCreate,
    useCargoEdit,
    useCargoView,
    useCargosList
} from './hooks';

// Компоненты для внешнего использования
export { 
    CargoCard, 
    CargoForm, 
    CargosList, 
    CargoView 
} from './components';

// Утилиты для внешнего использования
export { 
    formatters, 
    statusUtils, 
    dataUtils,
    validateField,
    validateForm
} from './utils';

// Константы для внешнего использования
export { 
    STATUS_CLASSES,
    STATUS_COLORS,
    EMPTY_CARGO,
    VALIDATION_MESSAGES
} from './constants';