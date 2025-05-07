import React, { useEffect, useMemo, useState } from 'react';
// Компонент графика на базе ECharts
import { ReactECharts } from './Echarts/ReactECharts';
// Компонент выбора валюты от Consta UI
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Text } from '@consta/uikit/Text';
import { Loader } from '@consta/uikit/Loader';
// Импорт стилей
import cl from './style.module.scss';

// Тип данных, приходящих с сервера
interface DataCur {
  date: string;        // дата ("2016-02-01")
  month: string;       // месяц и год ("фев 2016")
  indicator: string;   // название индикатора ("Курс доллара")
  value: number;       // значения (числовое значение: 72)
}

// Определяем допустимые валюты
type Item = '$' | '€' | '¥';
const items: Item[] = ['$', '€', '¥'];

// Соответствие валют их индикаторам (используем дженерик)
const indicatorMap: Record<Item, string> = {
  '$': 'Курс доллара',
  '€': 'Курс евро',
  '¥': 'Курс юаня',
};

// Заголовки для отображения на странице
const titleMap: Record<Item, string> = {
  '$': 'КУРС ДОЛЛАРА, $/₽',
  '€': 'КУРС ЕВРО, €/₽',
  '¥': 'КУРС ЮАНЯ, ¥/₽',
};

const App = () => {
  // Состояние с исходными данными с сервера
  const [dataCurrencies, setDataCurrencies] = useState<DataCur[]>([]);

  // Выбранная валюта
  const [value, setValue] = useState<Item>(items[0]);

  // Хук для запроса данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API_URL as string);
        const data: DataCur[] = await res.json();
        setDataCurrencies(data);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchData();
  }, []);

  // useMemo используется для фильтрации данных по выбранной валюте (на основе индикатора).
  // Это позволяет избежать повторных вычислений при неизменных dataCurrencies и value.
  const filteredData = useMemo(() => {
    const indicator = indicatorMap[value];
    return dataCurrencies.filter((d) => d.indicator === indicator);
  }, [dataCurrencies, value]);

  // useMemo используется для вычисления среднего значения курса за весь период.
  // Это значение пересчитывается только при изменении отфильтрованных данных.
  const averageValue = useMemo(() => {
    if (!filteredData.length) return null;
    const avg = filteredData.reduce((acc, d) => acc + d.value, 0) / filteredData.length;
    return (Math.ceil(avg * 10) / 10).toFixed(1); // округление до 1 знака после запятой в большую сторону
  }, [filteredData]);

  // useMemo используется для создания конфигурации графика ECharts.
  // Пересчитывается только если изменились данные или выбранная валюта.
  const chartOptions = useMemo(() => {
    if (!filteredData.length) return {};

    // Уникальные месяцы в порядке появления
    const months = Array.from(new Set(filteredData.map((d) => d.month)));

    // Значения курса для каждого месяца (по порядку)
    const monthValueMap = months.map((month) => {
      const item = filteredData.find((d) => d.month === month);
      return item?.value ?? null;
    });

    // Определение минимального и максимального значений курса для оси Y
    const values = filteredData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    let yMin, yMax;
    const step = Math.floor((maxValue - minValue) / 5);

    // Немного настраиваем масштаб оси Y для лучшей визуализации
    if (maxValue === values.at(-2)) {
      yMax = maxValue;
      yMin = Math.floor(minValue - step);
    } else if (minValue === values.at(0)) {
      yMax = Math.ceil(maxValue + step);
      yMin = minValue;
    } else {
      yMax = Math.ceil(maxValue + step);
      yMin = Math.floor(minValue - step);
    }
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--line-color').trim();
    return {
      // Настройка всплывающей подсказки (tooltip), появляется при наведении на точку графика
      tooltip: {
        trigger: 'axis', // Триггер по оси — показывать данные при наведении на ось X
        formatter: (params: any[]) => {
          if (!params?.length) return '';
          const { axisValue: month, data: val, seriesName, color } = params[0];

          // Кастомный tooltip
          return `
            <div class="${cl.tooltipWrapper}">
              <div class="${cl.tooltipMonth}">${month} год</div>
              <div class="${cl.tooltipLine}">
                <span class="${cl.tooltipColor}" style="background-color:${color};"></span>
                <span class="${cl.tooltipLabel}">${seriesName}</span>
                <b class="${cl.tooltipValue}">${val}₽</b>
              </div>
            </div>`;
        }
      },
      // Отступы "конейтера" с графиком
      grid: {
        left: 30,
        right: 30,
        top: 40,
        bottom: 40,
        containLabel: true, // Учитывать размеры подписей осей при расчёте отступов
      },
      // Настройка оси X (горизонтальной)
      xAxis: {
        type: 'category', // Категориальная ось (не числовая: "месяц год")
        data: months, // Массив месяцев по оси x
        axisLine: { show: false }, // Скрыть линию оси
        axisTick: { show: false }, // Скрыть засечки
        boundaryGap: false, // Линия начинается с первой категории
      },

      // Настройка оси Y (вертикальной)
      yAxis: {
        type: 'value', // Числовая ось
        min: yMin, // Минимальное значение оси, рассчитывается динамически
        max: yMax, // Максимальное значение оси
        interval: (yMax - yMin) / 4, // Шаг между делениями (4 интервала)
        axisLine: { show: false }, // Скрываем вертикальную линию оси
        splitLine: {
          lineStyle: {
            type: 'dashed', // Пунктирная линия сетки
            color: '#00416633', // Цвет линии сетки (взять с макета фигмы)
          }
        },
        axisLabel: {
          formatter: (val: number) => val === yMin ? '' : val, // Убираем подпись для нижней границы оси
        }
      },

      // Данные графика (серия данных)
      series: [{
        name: indicatorMap[value],  // Название серии, отображаемое в легенде и при наведении
        type: 'line', // Тип графика — линия
        data: monthValueMap, // Данные для построения графика, сгруппированные по месяцам
        smooth: false, // Отключаем сглаживание линии
        showSymbol: false, // Скрываем маркер на каждой точке данных на линии графика
        emphasis: {
          disabled: true, // Скрываем отображение точки при наведении на линии графика в точках значения
          itemStyle: { opacity: 0 },
          label: { show: false }, // Скрываем подписи при наведении
          symbol: 'none', // Убираем символ (иконку точки) при наведении на всём графике
        },
        itemStyle: { color: lineColor }, // Стиль точки в тултипе
        lineStyle: { width: 3, color: lineColor }, // Стиль линии — толщина и цвет
      }],
    };
  }, [filteredData, value]);

  return (
    <div className={cl.container}>
      <div className={cl.container__header_info}>
        <Text size="3xl" weight="bold" className={cl.title}>
          {titleMap[value]}
        </Text>
        <ChoiceGroup
          value={value}
          onChange={({ value }) => value && setValue(value)} // обновление выбранной валюты
          items={items}
          getItemLabel={(item: string | number) => item}
          multiple={false}
          name="CurrencyChoice"
        />
      </div>
      <div className={cl.container__block}>
        {dataCurrencies.length === 0 ? (
          <Loader size="m" className={cl.loader} />
        ) : (
          <ReactECharts option={chartOptions} style={{ height: 400, width: '100%' }} />
        )}
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
