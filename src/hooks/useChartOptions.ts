import { useMemo } from 'react';
import { DataCur } from './useCurrencies';

type Item = '$' | '€' | '¥';

const indicatorMap: Record<Item, string> = {
  '$': 'Курс доллара',
  '€': 'Курс евро',
  '¥': 'Курс юаня',
};

export const useChartOptions = (data: DataCur[], value: Item, cl: Record<string, string>) => {
  return useMemo(() => {
    if (!data.length) return {};

    const months = Array.from(new Set(data.map((d) => d.month)));
    const monthValueMap = months.map((month) => data.find((d) => d.month === month)?.value ?? null);
    const values = data.map(d => d.value);

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const step = Math.floor((maxValue - minValue) / 5);

    let yMin: number, yMax: number;

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
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          if (!params?.length) return '';
          const { axisValue: month, data: val, seriesName, color } = params[0];
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
        left: 30, right: 30, top: 40, bottom: 40, containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { show: false },
        axisTick: { show: false },
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        interval: (yMax - yMin) / 4,
        axisLine: { show: false },
        splitLine: {
          lineStyle: { type: 'dashed', color: '#00416633' },
        },
        axisLabel: {
          formatter: (val: number) => val === yMin ? '' : val,
        }
      },
      series: [{
        name: indicatorMap[value],
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
        itemStyle: { color: lineColor },
        lineStyle: { width: 3, color: lineColor },
      }],
    };
  }, [data, value]);
};
