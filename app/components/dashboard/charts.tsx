'use server';

import { fetchTotalPagesPerDayFor30Days } from "@/app/lib/fetchData";
import LineChart from '../lineChart';
import t from '@/app/locales/dictionaries';


export default async function PageChartWrapper({ trans }: {trans : (key:string) => string}) {
  const fetchedData = await fetchTotalPagesPerDayFor30Days();

  if(!fetchedData || fetchedData.date.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className='mb-4 text-xl md:text-2xl'>
        {trans("dashboard.recent_printed_page")}
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <LineChart
          title={trans('dashboard.printed_page')}
          xlabels={fetchedData.date}
          ydata={fetchedData.pages}
          maxY={Number(fetchedData.maxY)}
        />
      </div>
    </div>
  );
}

