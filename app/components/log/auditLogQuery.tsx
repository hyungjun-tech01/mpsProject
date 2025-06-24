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

export default function AuditLogQuery({
  dateFrom,
  dateTo,
  category,
}: {
  dateFrom: string,
  dateTo: string,
  category:string,
  periodStart?: string | null,
  periodEnd?: string | null,
}) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [securityChecked, setSecurityChecked] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  console.log('category', category);
  
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
    setPrivacyChecked(searchParams.get('privacy') === 'true');
    setSecurityChecked(searchParams.get('security') === 'true');
  }, [startDate, endDate, replace, pathname, searchParams]);

  const handleStartDateChange = (date: Date | null) => {
    if (!!date) {
      setStartDate(date);

      if (!!endDate) {
        let endTemp = endDate;
        if (endDate < date) {
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
    if (!!date) {
      setEndDate(date);

      if (!!startDate) {
        let startTemp = startDate;
        if (date < startDate) {
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

  const updateParams = (key: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.set(key, 'true');
    } else {
      params.delete(key);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handlePrivacyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setPrivacyChecked(checked);

    updateParams('privacy', checked);
  };

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSecurityChecked(checked);
    updateParams('security', checked);
  };

  return (
    <div className="flex gap-4 text-sm items-center">
      <div className="flex flex-row items-center gap-2">
      {/* From 날짜 */}
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700 w-30">{dateFrom}</label>
        <DatePicker
          selected={startDate}
          dateFormat="yyyy.MM.dd"
          placeholderText={dateFrom}
          className="w-36 h-10 border border-gray-300 pl-2 rounded"
          onChange={handleStartDateChange}
        />
      </div>
  
      {/* To 날짜 */}
      <div className="flex items-center gap-2 ml-2">
        <label className="text-sm font-medium text-gray-700 w-30">{dateTo}</label>
        <DatePicker
          selected={endDate}
          dateFormat="yyyy.MM.dd"
          placeholderText={dateTo}
          className="w-36 h-10 border border-gray-300 pl-2 rounded"
          onChange={handleEndDateChange}
        />
      </div>
       {/* 개인 정보 */}
      {category !== 'adminActionLogs' && 
        <div className="flex items-center gap-2 ml-2">
        <label className="flex items-center ml-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={privacyChecked}
            onChange={handlePrivacyChange}
            className="mr-1"
          />
          개인정보
        </label>
      </div>
      }

      {/* Security 체크박스 */}
      {category !== 'adminActionLogs' && 
      <div className="flex items-center gap-2 ml-2">
        <label className="flex items-center ml-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={securityChecked}
            onChange={handleSecurityChange}
            className="mr-1"
          />
          보안단어
        </label>
      </div>
      }
      
    </div>
  </div>
  );
}
