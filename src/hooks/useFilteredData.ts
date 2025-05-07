import { useMemo } from 'react';
import { DataCur } from './useCurrencies';

type Item = '$' | '€' | '¥';

const indicatorMap: Record<Item, string> = {
  '$': 'Курс доллара',
  '€': 'Курс евро',
  '¥': 'Курс юаня',
};

export const useFilteredData = (data: DataCur[], value: Item) => {
  return useMemo(() => {
    const indicator = indicatorMap[value];
    return data.filter((d) => d.indicator === indicator);
  }, [data, value]);
};
