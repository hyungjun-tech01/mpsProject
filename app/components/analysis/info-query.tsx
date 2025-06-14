'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { formatTimeYYYYpMMpDD } from '@/app/lib/utils';

export default function InfoQuery({
  translated,
  queryKeys,
  queryData,
  options
}: {
  translated: object;
  queryKeys: string[];
  queryData: object;
  options: object;
}) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

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

  const handleDeptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("dept", e.target.value);
    replace(`${pathname}?${params.toString()}`);
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("device", e.target.value);
    replace(`${pathname}?${params.toString()}`);
  };

  const handlejobTypeChange= (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set("jobType", e.target.value);
    replace(`${pathname}?${params.toString()}`);
  };


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
    if(!!queryData.periodStart) {
      const splittedStart = queryData.periodStart.split(".");
      const startDateTemp = new Date(splittedStart[0], splittedStart[1] - 1, splittedStart[2]);
      setStartDate(startDateTemp);
    } else {
      const now = new Date();
      now.setDate(1);
      setStartDate(now);
    };
    if(!!queryData.periodEnd) {
      const splittedEnd = queryData.periodEnd.split(".");
      const endDateTemp = new Date(splittedEnd[0], splittedEnd[1] - 1, splittedEnd[2]);
      setEndDate(endDateTemp);
    } else {
      const now = new Date();
      setEndDate(now);
    };
  }, [queryData.periodStart, queryData.periodEnd]);

  return (
    <div className='flex gap-4 text-sm'>
      <div className='flex-col md:flex-row'>
        <DatePicker 
          selected={startDate}
          placeholderText={translated.from}
          className='w-24 h-7 border border-gray-300 rounded-md pl-2 md:mr-2' 
          onChange={handleStartDateChange}
        />
        <DatePicker
          selected={endDate}
          placeholderText={translated.to}
          className='w-24 h-7 border border-gray-300 rounded-md pl-2 md:mr-2' 
          onChange={handleEndDateChange}
        />
      </div>
      {queryKeys.includes('dept') &&
        <div>
          <select id="dept-select"
            defaultValue=""
            className='w-32 h-7 ml-2 border border-gray-300 rounded-md'
            onChange={handleDeptChange}
          >
            {options.dept.map((item, idx) =>
                <option key={idx} value={item.value}>{item.title}</option>
            )}
          </select>
        </div>
      }
      <div>
        <input id="user-select"
          placeholder={translated.user_name_or_id}
          onChange={(e) => {
            handleUserSearch(e.target.value);
          }}
          className='h-7 ml-2 border border-gray-300 rounded-md pl-2'
        />
      </div>
      {queryKeys.includes('device') &&
        <div>
          <select id="device-select"
            defaultValue=""
            className='w-32 h-7 ml-2 border border-gray-300 rounded-md'
            onChange={handleDeviceChange}
          >
            {options.device.map((item, idx) =>
                <option key={idx} value={item.value}>{item.title}</option>
            )}
          </select>
        </div>
      }
      {queryKeys.includes('jobType') &&
        <div>
          <select id="jobType-select"
            defaultValue=""
            className='w-32 h-7 ml-2 border border-gray-300 rounded-md'
            onChange={handlejobTypeChange}
          >
            {options.jobType.map((item, idx) =>
                <option key={idx} value={item.value}>{item.title}</option>
            )}
          </select>
        </div>
      }
    </div>
  );
}
