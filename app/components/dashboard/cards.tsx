import {
  PaidOutlined,
  ScheduleOutlined,
  AccountCircleOutlined,
  InboxOutlined,
  PrintOutlined,
  FileCopyOutlined
} from '@mui/icons-material';
import { fetchUserCount,
  fetchPrinterCount,
  fetchTotalPagesPerDayFor30Days,
  fetchTodayPages
 } from '@/app/lib/fetchData';

const iconMap = {
  collected: PaidOutlined,
  users: AccountCircleOutlined,
  printers: PrintOutlined,
  pages: FileCopyOutlined
};

export default async function CardWrapper() {
  const [
    numberOfUsers,
    numberOfPrinters,
    totalPages,
    todayPages,
   ] = await Promise.all([
    fetchUserCount(),
    fetchPrinterCount(),
    fetchTotalPagesPerDayFor30Days(),
    fetchTodayPages()
  ]);

  return (
    <>
      {/* NOTE: Uncomment this code in Chapter 9 */}

      <Card title="Users" value={numberOfUsers} type="users" />
      <Card title="Printers" value={numberOfPrinters} type="printers" />
      <Card title="Total Pages" value={totalPages} type="pages" />
      <Card title="Today Pages" value={todayPages} type="pages"
      />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'users' | 'printers' | 'pages' | 'collected';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
