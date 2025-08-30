/**
 * Экспорт всех хуков модуля Cargos
 */

export { useCargos } from './useCargos';
export { useCargoForm } from './useCargoForm';

// Реэкспорт типов для удобства
export type {
    UseCargosReturn,
    UseCargoFormReturn,
    CargoInfo,
    PageType,
    CargoFilters,
    FormState,
    ValidationErrors
} from '../types';

// Готовые комбинированные хуки для частых случаев использования

import { useCargos } from './useCargos';
import { useCargoForm } from './useCargoForm';

/**
 * Комбинированный хук для страницы создания груза
 */
export const useCargoCreate = () => {
    const cargos = useCargos();
    const form = useCargoForm('create');

    const handleSubmit = async (): Promise<boolean> => {
        const isFormValid = await form.actions.submitForm();
        if (!isFormValid) return false;

        const success = await cargos.createCargo(form.formState.data);
        if (success) {
            form.actions.resetForm();
        }
        return success;
    };

    const handleCancel = () => {
        form.actions.resetForm();
        cargos.navigateTo({ type: 'list' });
    };

    return {
        ...form,
        isLoading: cargos.isLoading,
        handleSubmit,
        handleCancel,
        navigateToList: () => cargos.navigateTo({ type: 'list' })
    };
};

/**
 * Комбинированный хук для страницы редактирования груза
 */
export const useCargoEdit = (cargoGuid: string) => {
    const cargos = useCargos();
    const form = useCargoForm('edit');

    // Инициализация формы данными груза
    const cargo = cargos.getCargo(cargoGuid);
    if (cargo && form.formState.data.guid !== cargo.guid) {
        form.initializeForm(cargo);
    }

    const handleSubmit = async (): Promise<boolean> => {
        const isFormValid = await form.actions.submitForm();
        if (!isFormValid) return false;

        const success = await cargos.updateCargo(cargoGuid, form.formState.data);
        if (success) {
            // Переходим к просмотру обновленного груза
            const updatedCargo = cargos.getCargo(cargoGuid);
            if (updatedCargo) {
                cargos.navigateTo({ type: 'view', cargo: updatedCargo });
            }
        }
        return success;
    };

    const handleCancel = () => {
        if (cargo) {
            cargos.navigateTo({ type: 'view', cargo });
        } else {
            cargos.navigateTo({ type: 'list' });
        }
    };

    const handleDelete = async (): Promise<boolean> => {
        if (!cargo) return false;
        return await cargos.deleteCargo(cargo.guid);
    };

    return {
        ...form,
        cargo,
        isLoading: cargos.isLoading,
        handleSubmit,
        handleCancel,
        handleDelete,
        canDelete: cargo ? statusUtils.canDelete(cargo.status) : false,
        navigateToView: () => cargo && cargos.navigateTo({ type: 'view', cargo }),
        navigateToList: () => cargos.navigateTo({ type: 'list' })
    };
};

/**
 * Хук для страницы просмотра груза
 */
export const useCargoView = (cargoGuid: string) => {
    const cargos = useCargos();
    const cargo = cargos.getCargo(cargoGuid);

    const handleEdit = () => {
        if (cargo) {
            cargos.navigateTo({ type: 'edit', cargo });
        }
    };

    const handleDelete = async (): Promise<boolean> => {
        if (!cargo) return false;
        return await cargos.deleteCargo(cargo.guid);
    };

    const handlePublish = async (): Promise<boolean> => {
        if (!cargo) return false;
        return await cargos.publishCargo(cargo.guid);
    };

    return {
        cargo,
        isLoading: cargos.isLoading,
        handleEdit,
        handleDelete,
        handlePublish,
        canEdit: cargo ? statusUtils.canEdit(cargo.status) : false,
        canDelete: cargo ? statusUtils.canDelete(cargo.status) : false,
        canPublish: cargo ? statusUtils.canPublish(cargo.status) : false,
        navigateToEdit: handleEdit,
        navigateToList: () => cargos.navigateTo({ type: 'list' }),
        goBack: cargos.goBack
    };
};

/**
 * Хук для списка грузов с фильтрацией
 */
export const useCargosList = () => {
    const cargos = useCargos();

    const handleCreateNew = () => {
        cargos.navigateTo({ type: 'create' });
    };

    const handleViewCargo = (cargo: CargoInfo) => {
        cargos.navigateTo({ type: 'view', cargo });
    };

    const handleEditCargo = (cargo: CargoInfo) => {
        cargos.navigateTo({ type: 'edit', cargo });
    };

    return {
        cargos: cargos.cargos,
        isLoading: cargos.isLoading,
        filters: cargos.filters,
        setFilters: cargos.setFilters,
        searchQuery: cargos.searchQuery,
        setSearchQuery: cargos.setSearchQuery,
        refreshCargos: cargos.refreshCargos,
        handleCreateNew,
        handleViewCargo,
        handleEditCargo
    };
};

// Импорт утилит для использования в комбинированных хуках
import { statusUtils } from '../utils';
import { CargoInfo } from '../types';
