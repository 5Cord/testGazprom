import { useMemo } from 'react';
import { DataCur } from './useCurrencies';

// Тип валюты, которую мы будем поддерживать
type Item = '$' | '€' | '¥';

// Карта, которая связывает валюту с ее названием для отображения на графике
const indicatorMap: Record<Item, string> = {
  '$': 'Курс доллара',
  '€': 'Курс евро',
  '¥': 'Курс юаня',
};

// Хук для формирования настроек графика (опции для ECharts)
export const useChartOptions = (data: DataCur[], value: Item, cl: Record<string, string>) => {
  return useMemo(() => {
    // Если данные пусты, возвращаем пустой объект (пустой график)
    if (!data.length) return {};

    // Массив уникальных месяцев для оси X
    const months = Array.from(new Set(data.map((d) => d.month)));

    // Создаем массив значений для каждого месяца
    const monthValueMap = months.map((month) => data.find((d) => d.month === month)?.value ?? null);

    // Массив всех значений для нахождения минимума и максимума
    const values = data.map(d => d.value);

    // Вычисляем минимальное и максимальное значения для оси Y
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // Расчитываем шаг для оси Y (делим диапазон на 5 частей)
    const step = Math.floor((maxValue - minValue) / 5);

    // Инициализация переменных для минимального и максимального значений оси Y
    let yMin: number, yMax: number;

    // Логика для вычисления точных значений для yMin и yMax с учетом данных
    if (maxValue === values.at(-2)) {
      // Если максимальное значение — последнее (но не самое крайнее), то yMax — это максимальное значение,
      // а yMin — минимальное значение с шагом вниз
      yMax = maxValue;
      yMin = Math.floor(minValue - step);
    } else if (minValue === values.at(0)) {
      // Если минимальное значение — первое, то yMax увеличивается на шаг, а yMin остается минимальным
      yMax = Math.ceil(maxValue + step);
      yMin = minValue;
    } else {
      // В остальных случаях увеличиваем yMax на шаг и уменьшаем yMin
      yMax = Math.ceil(maxValue + step);
      yMin = Math.floor(minValue - step);
    }

    // Получаем цвет линии для графика из CSS переменной (предполагается, что переменная определена в глобальных стилях)
    const lineColor = getComputedStyle(document.documentElement).getPropertyValue('--line-color').trim();

    return {
      tooltip: {
        // Настройки подсказки при наведении на элементы графика
        trigger: 'axis', // Подсказка для всей оси
        formatter: (params: any[]) => {
          // Если данных нет, возвращаем пустую строку
          if (!params?.length) return '';
          
          // Извлекаем данные для отображения из первого параметра подсказки
          const { axisValue: month, data: val, seriesName, color } = params[0];

          // Формируем HTML для подсказки
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
      grid: {
        // Отступы для графика
        left: 30, right: 30, top: 40, bottom: 40, containLabel: true,
      },
      xAxis: {
        // Ось X
        type: 'category', // Категориальная ось (месяцы)
        data: months, // Данные для оси X (месца)
        axisLine: { show: false }, // Отключаем ось X
        axisTick: { show: false }, // Отключаем метки на оси X
        boundaryGap: false, // Отключаем отступы по краям
      },
      yAxis: {
        // Ось Y
        type: 'value', // Ось значений
        min: yMin, // Минимальное значение для оси Y
        max: yMax, // Максимальное значение для оси Y
        interval: (yMax - yMin) / 4, // Интервал между метками на оси Y
        axisLine: { show: false }, // Отключаем ось Y
        splitLine: {
          // Линии, разделяющие сектора на оси Y
          lineStyle: { type: 'dashed', color: '#00416633' },
        },
        axisLabel: {
          // Форматирование меток на оси Y
          formatter: (val: number) => val === yMin ? '' : val, // Убираем метку для минимального значения
        }
      },
      series: [{
        // Данные для серии графика
        name: indicatorMap[value], // Имя серии, соответствующее выбранной валюте
        type: 'line', // Тип графика: линия
        data: monthValueMap, // Данные для линии (значения по месяцам)
        smooth: false, // Отключаем сглаживание линии
        showSymbol: false, // Не показываем символы на точках линии
        emphasis: {
          // Настройки для выделения элемента на графике
          disabled: true, // Отключаем выделение
          itemStyle: { opacity: 0 }, // Отключаем выделение символа
          label: { show: false }, // Отключаем отображение метки
          symbol: 'none', // Отключаем символ
        },
        itemStyle: { color: lineColor }, // Цвет линий
        lineStyle: { width: 3, color: lineColor }, // Толщина линии и цвет
      }],
    };
  }, [data, value, cl]); // Добавлены отсутствующие зависимости
};
