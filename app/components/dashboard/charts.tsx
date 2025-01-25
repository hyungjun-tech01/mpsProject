import PageChart from './page-chart';
import { fetchTotalPagesPerDayFor30Days } from "@/app/lib/fetchData";


export default async function PageChartWrapper() {
  const fetchedData = await fetchTotalPagesPerDayFor30Days();

  if(!fetchedData || fetchedData.date.length === 0) {
    return <p className="mt-4 text-gray-400">No data available.</p>;
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className='mb-4 text-xl md:text-2xl'>
        Recent Printed Pages
      </h2>
      <div className="rounded-xl bg-gray-50 p-4">
        <PageChart labels={fetchedData.date} ydata={fetchedData.pages} maxY={Number(fetchedData.maxY)} />
      </div>
    </div>
  );
}

