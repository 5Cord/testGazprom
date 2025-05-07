import React, { useState } from 'react';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Text } from '@consta/uikit/Text';
import { Loader } from '@consta/uikit/Loader';
import { ReactECharts } from './Echarts/ReactECharts';

import cl from './style.module.scss';
import { useCurrencies } from './hooks/useCurrencies'; // Хук для получения данных о курсах валют
import { useFilteredData } from './hooks/useFilteredData'; // Хук для фильтрации данных в зависимости от выбранной валюты
import { useAverageValue } from './hooks/useAverageValue'; // Хук для расчета среднего значения
import { useChartOptions } from './hooks/useChartOptions'; // Хук для получения настроек для графика

// Тип и массив возможных валют для выбора
type Item = '$' | '€' | '¥';
const items: Item[] = ['$', '€', '¥'];

// Заголовки для разных валют
const titleMap: Record<Item, string> = {
  '$': 'КУРС ДОЛЛАРА, $/₽',
  '€': 'КУРС ЕВРО, €/₽',
  '¥': 'КУРС ЮАНЯ, ¥/₽',
};

const App = () => {
  // Получаем данные о курсах валют с бэкенда
  const dataCurrencies = useCurrencies();

  // Состояние для выбранной валюты (по умолчанию - доллар)
  const [value, setValue] = useState<Item>(items[0]);

  // Фильтруем данные по выбранной валюте
  const filteredData = useFilteredData(dataCurrencies, value);

  // Вычисляем среднее значение курса за период
  const averageValue = useAverageValue(filteredData);

  // Настраиваем опции для графика (передаем данные, валюту и стили)
  const chartOptions = useChartOptions(filteredData, value, cl);

  return (
    <div className={cl.container}>
      {/* Шапка с заголовком и переключателем валют */}
      <div className={cl.container__header_info}>
        <Text size="3xl" weight="bold" className={cl.title}>
          {titleMap[value]}
        </Text>
        <ChoiceGroup
          value={value}
          onChange={({ value }) => value && setValue(value)}
          items={items}
          getItemLabel={(item) => item}
          multiple={false}
          name="CurrencyChoice"
        />
      </div>

      {/* Основной блок с графиком и средней ценой */}
      <div className={cl.container__block}>
        {dataCurrencies.length === 0 ? (
          // Показываем лоадер, если данные еще не загрузились
          <Loader size="m" className={cl.loader} />
        ) : (
          // Рендерим график с подготовленными данными
          <ReactECharts option={chartOptions} style={{ height: 400, width: '100%' }} />
        )}

        {/* Блок с отображением среднего значения за период */}
        <div className={cl.container__avg_period}>
          <Text className={cl.container__avg_period_text} size="xl" weight="regular">
            Среднее за период:
          </Text>
          <Text className={cl.container__avg_period_number} size="4xl">
            {averageValue ?? 'Нет данных'}
            {averageValue && <span className={cl.container__ruble}>₽</span>}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default App;