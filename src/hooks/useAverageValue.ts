import { useMemo } from 'react';
import { DataCur } from './useCurrencies';

// Хук для вычисления среднего значения курса валют из данных
export const useAverageValue = (data: DataCur[]) => {
  return useMemo(() => {
    // Если массив данных пуст, возвращаем null
    if (!data.length) return null;

    // Считаем среднее значение курса валюты
    const avg = data.reduce((acc, d) => acc + d.value, 0) / data.length;

    // Округляем среднее значение до одного знака после запятой и возвращаем как строку
    return (Math.ceil(avg * 10) / 10).toFixed(1);
  }, [data]); // Хук пересчитывает среднее значение только когда изменяются данные
};
