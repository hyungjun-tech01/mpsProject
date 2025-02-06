import {
  PaidOutlined,
  ScheduleOutlined,
  AccountCircleOutlined,
  InboxOutlined,
  PrintOutlined,
  FileCopyOutlined,
} from "@mui/icons-material";
import {
  fetchUserCount,
  fetchDevices,
  fetchAllTotalPageSum,
  fetchTodayTotalPageSum,
  fetchLatestDeviceStatus,
} from "@/app/lib/fetchData";

const iconMap = {
  collected: PaidOutlined,
  users: AccountCircleOutlined,
  devices: PrintOutlined,
  pages: FileCopyOutlined,
};

export default async function CardWrapper() {
  const [numberOfUsers, devices, totalPages, todayPages, latestDeviceStatus] =
    await Promise.all([
      fetchUserCount(),
      fetchDevices(),
      fetchAllTotalPageSum(),
      fetchTodayTotalPageSum(),
      fetchLatestDeviceStatus(),
    ]);

  let normalDeviceCount = 0;
  let abnormalDeviceCount = 0;
  devices.forEach(device => {
    const foundIdx = latestDeviceStatus.findIndex(status => status.printer_id === device.printer_id);
    if (foundIdx === -1) {
      normalDeviceCount++;
    } else {
      if (latestDeviceStatus.at(foundIdx).hardware_check_status === 'N') {
        normalDeviceCount++;
      } else {
        abnormalDeviceCount++;
      }
    }
  });
  const devicesInfo = [
    { title: 'Total', value: devices.length },
    { title: 'Normal', value: normalDeviceCount },
    { title: 'Error', value: abnormalDeviceCount }
  ];

  return (
    <>
      <Card title="Users" value={numberOfUsers} type="users" />
      <Card title="Devices" value={devicesInfo} type="devices" />
      <Card title="Total Pages" value={totalPages || 0} type="pages" />
      <Card title="Today Pages" value={todayPages || 0} type="pages" />
    </>
  );
}

export function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string | object;
  type: "users" | "devices" | "pages" | "collected";
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      {typeof value !== 'object' &&
        <p className={`truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`} >
          {value}
        </p>
      }
      {typeof value === 'object' &&
        <div className="flex justify-between">
          {
            value.map((item, idx) =>
              <div key={idx} className="flex-1 truncate rounded-xl bg-white px-4 py-4 text-center" >
                <div className="text-l">{item.title}</div>
                <div className="text-2xl">{item.value}</div>
              </div>
            )
          }
        </div>
      }
    </div>
  );
}
