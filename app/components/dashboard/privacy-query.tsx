'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatDBTime } from '@/app/lib/utils';

export default function PrivacyQuery({
  translated,
  departments,
  period,
  periodStart,
  periodEnd,
  dept,
}: {
  translated: object;
  departments: {title:string, value:string}[];
  period: "today" | "week" | "month" | "specified",
  periodStart?: string,
  periodEnd?: string,
  dept?: string,
}) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const periodOptions = [
    { title:translated.today, value: 'today'},
    { title: translated.week, value: 'week'},
    { title: translated.month, value: 'month'},
    { title: translated.specified, value: 'specified'},
  ];

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("period", e.target.value);
    replace(`${pathname}?${params.toString()}`);
  }

  const handleStartDateChange = (date: Date | null) => {
    if(!!date) {
      let startDay = new Date();
      const params = new URLSearchParams(searchParams);

      if(date < startDay) {
        startDay = date;
      }

      setStartDate(startDay);
      params.set("periodStart", formatDBTime(startDay));

      let endDay = new Date();
      if(!endDate) {
        setEndDate(endDay);
        params.set("periodEnd", formatDBTime(endDay));
      } else if(startDay > endDate) {
        endDay = startDay;
        setEndDate(endDay);
        params.set("periodEnd", formatDBTime(endDay));
      }

      replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    if(!!date) {
      setEndDate(date);

      const params = new URLSearchParams(searchParams);
      params.set("periodEnd", formatDBTime(date));

      let startDay = new Date();
      if(!startDate) {
        if(date < startDay) {
          startDay = date;
        }
      } else if(startDate > date) {
        startDay = date;
        setStartDate(startDay);
        params.set("periodStart", formatDBTime(startDay));
      }

      replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("dept", e.target.value);
    replace(`${pathname}?${params.toString()}`);
  }

  const handleUserSearch = useDebouncedCallback((term: string) => {
    console.log(`Searching... ${term}`);

    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("user", term);
    } else {
      params.delete("user");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  useEffect(() => {
  //   console.log(`useEffect - parame : period ${period}, dept ${dept}`);
  //   setPeriodState(period);
  //   // if(period === "specified") {
      if(!!periodStart) {
        const splittedStart = periodStart.split(".");
        const startDateTemp = new Date(splittedStart[0], splittedStart[1] - 1, splittedStart[2]);
        setStartDate(startDateTemp);
      }
      if(!!periodEnd) {
        const splittedEnd = periodEnd.split(".");
        const endDateTemp = new Date(splittedEnd[0], splittedEnd[1] - 1, splittedEnd[2]);
        setEndDate(endDateTemp);
      }
  //   // }
  }, [periodStart, periodEnd]);

  return (
    <div className='flex gap-4 text-sm'>
      <div>
        <label htmlFor="period-select">{ translated.period + ' :'}</label>
        <select id="period-select" 
          defaultValue={period} 
          className='ml-2 border border-gray-300'
          onChange={handlePeriodChange}
        >
          {periodOptions.map((item, idx) =>
            <option key={idx} value={item.value}>{item.title}</option>
          )}
        </select>
      </div>
      {period === "specified" && (
        <div className='flex gap-2 md:flex-col'>
          <DatePicker 
            selected={startDate}
            placeholderText={translated.from}
            className='w-24 border border-gray-300 pl-2' 
            onChange={handleStartDateChange}
          />
          <DatePicker
            selected={endDate}
            placeholderText={translated.to}
            className='w-24 border border-gray-300 pl-2'
            onChange={handleEndDateChange}
          />
        </div>
      )}
      <div>
        <label htmlFor="dept-select">{translated.department + ' :'}</label>
        <select id="dept-select"
          defaultValue={dept ?? "all" }
          className='ml-2 border border-gray-300'
          onChange={handleDeptChange}
        >
          {departments.map((item, idx) =>
            <option key={idx} value={item.value}>{item.title}</option>
          )}
        </select>
      </div>
      <div>
        <label htmlFor="user-input">{translated.user_name_or_id + ' :'}</label>
        <input id="user-select" className='ml-2 border border-gray-300' onChange={(e) => handleUserSearch(e.target.value)}/>
      </div>
    </div>
  );
}
