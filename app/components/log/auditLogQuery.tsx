'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatTimeYYYYpMMpDD } from '@/app/lib/utils';

const getMonthStartAndToday = () => {
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return { monthStart, today };
};

export default function auditLogQuery({
  dateFrom,
  dateTo,
  periodStart,
  periodEnd,
}: {
  dateFrom: string,
  dateTo: string,
  periodStart?: string,
  periodEnd?: string,
}) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    if (!startDate || !endDate) {
      const { monthStart, today } = getMonthStartAndToday();

      setStartDate(monthStart);
      setEndDate(today);

      const params = new URLSearchParams(searchParams);
      params.set("periodStart", formatTimeYYYYpMMpDD(monthStart));
      params.set("periodEnd", formatTimeYYYYpMMpDD(today));
      replace(`${pathname}?${params.toString()}`);
    }
  }, [startDate, endDate, replace, pathname, searchParams]);

  const handleStartDateChange = (date: Date | null) => {
    if(!!date) {
      setStartDate(date);

      if(!!endDate) {
        let endTemp = endDate;
        if(endDate < date) {
          setEndDate(date);
          endTemp = date;
        }
  
        const params = new URLSearchParams(searchParams);
        params.set("periodStart", formatTimeYYYYpMMpDD(date));
        params.set("periodEnd", formatTimeYYYYpMMpDD(endTemp));
        replace(`${pathname}?${params.toString()}`);
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if(!!date) {
      setEndDate(date);

      if(!!startDate) {
        let startTemp = startDate;
        if(date < startDate) {
          setStartDate(date);
          startTemp = date;
        }

        const params = new URLSearchParams(searchParams);
        params.set("periodStart", formatTimeYYYYpMMpDD(startTemp));
        params.set("periodEnd", formatTimeYYYYpMMpDD(date));
        replace(`${pathname}?${params.toString()}`);
      }
    }
  };
  return (
    <div className='flex gap-4 text-sm'>
      <div className='flex-col md:flex-row'>
        <DatePicker 
          selected={startDate}
          placeholderText={dateFrom}
          className='w-24 border border-gray-300 pl-2 md:mr-2' 
          onChange={handleStartDateChange}
        />
        <DatePicker
          selected={endDate}
          placeholderText={dateTo}
          className='w-24 border border-gray-300 pl-2'
          onChange={handleEndDateChange}
        />
      </div>
    </div>
  );
}
