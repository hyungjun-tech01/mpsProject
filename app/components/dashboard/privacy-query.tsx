'use client';

import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function PrivacyQuery({
  translated,
  departments,
  period,
  dept,
  user,
}: {
  translated: object;
  departments: {title:string, value:string}[];
  period: "today" | "week" | "month" | "specified",
  dept?: string,
  user?: string,
}) {
  const [periodValue, setPeriodValue] = useState<string>(period);
  const [deptValue, setDeptValue] = useState<string | undefined>(dept);
  const [userValue, setUserValue] = useState<string | undefined>(user);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const periodOptions = [
    { title:translated.today, value: 'today'},
    { title: translated.week, value: 'week'},
    { title: translated.month, value: 'month'},
    { title: translated.specified, value: 'specified'},
  ];

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
        <label htmlFor="period-select">{ translated.period + ' :'}</label>
        <select id="period-select" defaultValue={period} className='ml-2 border border-gray-300'>
          {periodOptions.map((item, idx) =>
            <option key={idx} value={item.value}>{item.title}</option>
          )}
        </select>
      </div>
      <div>
        <label htmlFor="dept-select">{translated.department + ' :'}</label>
        <select id="dept-select" defaultValue={dept ?? "all" } className='ml-2 border border-gray-300'>
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
