// Импорт необходимых модулей и внешних UI-компонентов
import React, { useEffect, useMemo, useState } from 'react';
import { ReactECharts } from './Echarts/ReactECharts'; // компонент для графика
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup'; // компонент выбора валюты
import { Text } from '@consta/uikit/Text'; // текстовый компонент
import cl from './style.module.css'; // стили для оформления

// Тип данных, которые приходят с сервера
interface DataCur {
  date: string; // fix: изменено с Date на string
  month: string;
  indicator: string;
  value: number;
}

type Item = '$' | '€' | '¥'; // fix: указали тип значений

function App() {
  const [dataCurrencies, setDataCurrencies] = useState<DataCur[]>([]);
  const items: Item[] = ['$', '€', '¥'];
  const [value, setValue] = useState<Item>(items[0]);

  // Получение данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(process.env.REACT_APP_API_URL as string);
        const data: DataCur[] = await response.json();
        setDataCurrencies(data);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchData(); // fix: обернули в async функцию, чтобы избежать лишнего then/catch
  }, []);

  const getIndicatorName = (symbol: Item) => {
    switch (symbol) {
      case '$': return 'Курс доллара';
      case '€': return 'Курс евро';
      case '¥': return 'Курс юаня';
    }
  };


  const getTitleText = (symbol: Item) => {
    switch (symbol) {
      case '$': return 'КУРС ДОЛЛАРА, $/₽';
      case '€': return 'КУРС ЕВРО, €/₽';
      case '¥': return 'КУРС ЮАНЯ, ¥/₽';
    }
  };

  // Среднее значение
  const averageValue = useMemo(() => {
    const indicatorName = getIndicatorName(value);
    const filteredData = dataCurrencies.filter(d => d.indicator === indicatorName);

    if (!filteredData.length) return null;

    const sum = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    const avg = sum / filteredData.length;

    return (Math.ceil(avg * 100) / 100).toFixed(1); // округление вверх до 1 знака
  }, [dataCurrencies, value]);


  // Опции для графика
  const chartOptions = useMemo(() => {
    const indicatorName = getIndicatorName(value);
    const filteredData = dataCurrencies.filter(d => d.indicator === indicatorName);

    if (!filteredData.length) return {}; // fix: добавлена проверка на пустой option

    const months = Array.from(new Set(filteredData.map(d => d.month)));

    const monthValueMap = months.map(month => {
      const item = filteredData.find(d => d.month === month);
      return item ? item.value : null; // fix: возвращаем null
    });

    const values = filteredData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    let yMin, yMax;

    const step = Math.floor((maxValue - minValue) / 5)
    if (maxValue === values.at(-2)) {
      yMax = maxValue
      yMin = Math.floor(minValue - step)
    } else if (minValue === values.at(0)) {
      yMax = Math.ceil(maxValue + step)
      yMin = minValue
    } else {
      yMax = Math.ceil(maxValue + step)
      yMin = Math.floor(minValue - step)
    }

    console.log({ maxValue, yMax })
    console.log({ minValue, yMin })

    const series = [{
      name: indicatorName,
      type: 'line',
      data: monthValueMap,
      smooth: false,
      showSymbol: false,
      emphasis: {
        disabled: true,
        itemStyle: { opacity: 0 },
        label: { show: false },
        symbol: 'none',
      },
      itemStyle: { color: '#F38B00' },
      lineStyle: { width: 3, color: '#F38B00' },
    }];

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          if (!params?.length) return '';
          const data = params[0];
          const month = data.axisValue;
          const value = data.data;
          const indicatorName = data.seriesName;

          return `
            <div class="${cl.tooltipWrapper}">
              <div class="${cl.tooltipMonth}">${month} год</div>
              <div class="${cl.tooltipLine}">
                <span class="${cl.tooltipColor}" style="background-color:${data.color};"></span>
                <span class="${cl.tooltipLabel}">${indicatorName}</span>
                <b class="${cl.tooltipValue}">${value}₽</b>
              </div>
            </div>`;
        }
      },
      grid: {
        left: 30,
        right: 30,
        top: 40,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { show: false },
        axisTick: {
          show: false,
        },
        boundaryGap: false,  // fix: растянули по всей ширине
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        interval: (yMax - yMin) / 4,
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#00416633'
          }
        },
        axisLabel: {
          formatter: (value: number) => {
            return value === yMin ? '' : value;
          }
        },
      },
      series,
    };
  }, [dataCurrencies, value]);

  return (
    <div className={cl.container}>
      <div className={cl.container__header_info}>
        <Text size="3xl" weight="bold" className={cl.title}>
          {getTitleText(value)}
        </Text>
        <ChoiceGroup
          value={value}
          onChange={({ value }) => value && setValue(value)} // fix: защита от null
          items={items}
          getItemLabel={(item) => item}
          multiple={false}
          name="CurrencyChoice"
        />
      </div>
      <div className={cl.container__block}>
        <ReactECharts option={chartOptions} style={{ height: 400, width: '100%' }} />
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
}

export default App;
