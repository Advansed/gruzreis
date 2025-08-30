import { useState, useMemo } from 'react';
import { useCargos } from './useCargos';
import { CargoStatus } from '../types';
import { useSelector } from '../../Store';

const useCargoArchive = () => {
  const { isLoading, refreshCargos } = useCargos();
  const cargos = useSelector((state) => state.cargos, 12);
  const [refreshing, setRefreshing] = useState(false);

  // Фильтруем завершенные заказы
  const archiveCargos = useMemo(() => {
    const jarr = cargos.filter(cargo => cargo.status === CargoStatus.COMPLETED);
    console.log( jarr )
    return jarr
  }, [cargos]);

  const refresh = async () => {
    setRefreshing(true);
    await refreshCargos();
    setRefreshing(false);
  };

  return {
    cargos: archiveCargos,
    loading: isLoading,
    refreshing,
    refresh
  };
};

export default useCargoArchive;