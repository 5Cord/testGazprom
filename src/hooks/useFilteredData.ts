import { useMemo } from 'react'; // Импортируем useMemo для мемоизации результатов
import { DataCur } from './useCurrencies'; // Тип данных для курса валют, импортируем его для использования в фильтрации

// Тип валют, которые могут быть выбраны
type Item = '$' | '€' | '¥';

// Маппинг для преобразования валют в соответствующие имена индикаторов
const indicatorMap: Record<Item, string> = {
  '$': 'Курс доллара', // Привязываем доллар к индикатору 
  '€': 'Курс евро',  
  '¥': 'Курс юаня',    
};

// Хук для фильтрации данных о курсах валют в зависимости от выбранной валюты
export const useFilteredData = (data: DataCur[], value: Item) => {
  // Используем useMemo для мемоизации отфильтрованных данных, чтобы избежать лишних перерасчетов
  return useMemo(() => {
    // Определяем соответствующий индикатор для выбранной валюты
    const indicator = indicatorMap[value];

    // Фильтруем массив данных по индикатору, выбирая только те записи, которые соответствуют выбранной валюте
    return data.filter((d) => d.indicator === indicator);
  }, [data, value]); // Пересчитываем мемоизированное значение только в случае изменения данных или выбранной валюты
};
