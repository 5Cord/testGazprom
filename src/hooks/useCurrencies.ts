import { useEffect, useState } from 'react';

// Определяем интерфейс для структуры данных о курсах валют
export interface DataCur {
  date: string;      // Дата записи курса валюты
  month: string;     // Месяц записи курса валюты
  indicator: string; // Индикатор валюты (например, курс доллара, евро и т.д.)
  value: number;     // Значение курса валюты
}

export const useCurrencies = () => {
  // Состояние для хранения данных о курсах валют
  const [data, setData] = useState<DataCur[]>([]);

  // useEffect с пустым массивом зависимостей - этот эффект сработает только один раз при монтировании компонента
  useEffect(() => {
    // Асинхронная функция для получения данных с API
    const fetchData = async () => {
      try {
        // Получаем данные с API, URL берется из переменной окружения
        const res = await fetch(process.env.REACT_APP_API_URL as string);
        
        // Парсим полученные данные в формат массива объектов DataCur
        const result: DataCur[] = await res.json();
        
        // Обновляем состояние с полученными данными
        setData(result);
      } catch (error) {
        // Если произошла ошибка при получении данных, выводим ошибку в консоль
        console.error('Ошибка при получении данных:', error);
      }
    };

    // Вызываем функцию для получения данных
    fetchData();
  }, []); // Пустой массив зависимостей означает, что этот эффект выполнится только один раз при монтировании компонента

  // Возвращаем полученные данные о курсах валют
  return data;
};
