'use client';

import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function PrivacyQuery({
  trans,
  period,
  dept,
  user,
}: {
  trans: (key: string) => string;
  period: string,
  dept?: string,
  user?: string,
}) {
  const [periodValue, setPeriodValue] = useState<string>(period);
  const [deptValue, setDeptValue] = useState<string | undefined>(dept);
  const [userValue, setUserValue] = useState<string | undefined>(user);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

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

  return (
    <div className='flex gap-4 text-sm'>
      <div>
        <label htmlFor="period-select">{trans('common.period') + ' :'}</label>
        <select id="period-select" className='ml-2 border border-gray-300'>
          <option value="today">{trans('common.today')}</option>
          <option value="week">{trans('common.week')}</option>
          <option value="month">{trans('common.month')}</option>
          <option value="specified">{trans('common.specified_period')}</option>
        </select>
      </div>
      <div>
        <label htmlFor="dept-select">{trans('user.department') + ' :'}</label>
        <select id="dept-select" className='ml-2 border border-gray-300'>
          <option value="all">전체</option>
          <option value="영업부">영업부</option>
          <option value="관리부">관리부</option>
        </select>
      </div>
      <div>
        <label htmlFor="user-input">{trans('dashboard.user_name_or_id') + ' :'}</label>
        <input id="user-select" className='ml-2 border border-gray-300' onChange={(e) => handleUserSearch(e.target.value)}/>
      </div>
    </div>
  );
}
