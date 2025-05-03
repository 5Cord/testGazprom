import React, { useEffect, useMemo, useState } from 'react';
import { ReactECharts } from './Echarts/ReactECharts';
import { Theme, presetGpnDefault } from '@consta/uikit/Theme';
import { ChoiceGroup } from '@consta/uikit/ChoiceGroup';
import { Text } from '@consta/uikit/Text';
import cl from './style.module.css';

interface DataCur {
  date: Date;
  month: string;
  indicator: string;
  value: number;
}
type Item = string;

function App() {
  const [dataCurrencies, setDataCurrencies] = useState<DataCur[]>([]);
  const items: Item[] = ['$', '€', '¥'];
  const [value, setValue] = useState<Item | null>(items[0]);

  useEffect(() => {
    fetch('https://6814e644225ff1af162a755a.mockapi.io/ExRate')
      .then(response => response.json())
      .then((data: DataCur[]) => {
        setDataCurrencies(data);
      })
      .catch(error => console.log(error));
  }, []);

  const getIndicatorName = (symbol: string | null) => {
    switch (symbol) {
      case '$': return 'Курс доллара';
      case '€': return 'Курс евро';
      case '¥': return 'Курс юаня';
      default: return 'Курс доллара';
    }
  };

  const getTitleText = (symbol: string | null) => {
    switch (symbol) {
      case '$': return 'КУРС ДОЛЛАРА, $/₽';
      case '€': return 'КУРС ЕВРО, €/₽';
      case '¥': return 'КУРС ЮАНЯ, ¥/₽';
      default: return 'КУРС ДОЛЛАРА, $/₽';
    }
  };

  const averageValue = useMemo(() => {
    if (!dataCurrencies.length || !value) return null;

    const indicatorName = getIndicatorName(value);
    const filteredData = dataCurrencies.filter(d => d.indicator === indicatorName);
    if (!filteredData.length) return null;

    const sum = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    const avg = sum / filteredData.length;
    return avg.toFixed(2);
  }, [dataCurrencies, value]);

  const chartOptions = useMemo(() => {
    if (!dataCurrencies.length || !value) return {};

    const indicatorName = getIndicatorName(value);
    const filteredData = dataCurrencies.filter(d => d.indicator === indicatorName);

    const months = Array.from(new Set(filteredData.map(d => d.month)));

    const values = filteredData.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const yMin = Math.floor(minValue - 5);
    const yMax = Math.ceil(maxValue + 5);

    const series = [{
      name: indicatorName,
      type: 'line',
      data: months.map(month => {
        const item = filteredData.find(d => d.month === month);
        return item ? item.value : null;
      }),
      smooth: false,
      showSymbol: false,
      itemStyle: {
        color: '#F38B00'
      },
      lineStyle: {
        width: 3,
        color: '#F38B00'
      }
    }];

    return {
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        left: 0,
        right: 0,
        top: 40,
        bottom: 40,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: {
          show: false
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: {
            color: '#9999990'
          }
        }
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee'
          }
        }
      },
      series,
    };
  }, [dataCurrencies, value]);


  return (
    <div className={cl.container}>
      <Theme preset={presetGpnDefault}>
        <div className={cl.headerInfo}>
          <h1>{getTitleText(value)}</h1>
          <ChoiceGroup
            value={value}
            onChange={({ value }) => setValue(value)}
            items={items}
            getItemLabel={(item) => item}
            multiple={false}
            name="CurrencyChoice"
          />
        </div>
        <div className={cl.block}>
          <ReactECharts option={chartOptions} style={{ height: 400, width: '100%' }} />
          <div className={cl.avgPeriodBlock}>
            <Text className={cl.avgPeriodBlock_text} size="xl" weight="light">Среднее за период:</Text>
            <Text className={cl.avgPeriodBlock_number} size="5xl">
              {averageValue ?? 'Нет данных'}
              {averageValue && (
                <span className={cl.ruble}>₽</span>
              )}
            </Text>

          </div>
        </div>
      </Theme>
    </div>
  );
}

export default App;
