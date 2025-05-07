import { useEffect, useState } from 'react';

export interface DataCur {
  date: string;
  month: string;
  indicator: string;
  value: number;
}

export const useCurrencies = () => {
  const [data, setData] = useState<DataCur[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(process.env.REACT_APP_API_URL as string);
        const result: DataCur[] = await res.json();
        setData(result);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      }
    };

    fetchData();
  }, []);

  return data;
};
