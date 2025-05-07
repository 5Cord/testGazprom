import { useMemo } from 'react';
import { DataCur } from './useCurrencies';

export const useAverageValue = (data: DataCur[]) => {
  return useMemo(() => {
    if (!data.length) return null;
    const avg = data.reduce((acc, d) => acc + d.value, 0) / data.length;
    return (Math.ceil(avg * 10) / 10).toFixed(1);
  }, [data]);
};
