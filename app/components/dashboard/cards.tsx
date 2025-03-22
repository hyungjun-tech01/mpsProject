import {
  PaidOutlined,
  AccountCircleOutlined,
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
import getDictionary from "@/app/locales/dictionaries";


const iconMap = {
  collected: PaidOutlined,
  users: AccountCircleOutlined,
  devices: PrintOutlined,
  pages: FileCopyOutlined,
};


export default async function CardWrapper({ trans }: {trans : (key:string) => string}) {
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
    { title: trans('dashboard.total_device'), value: devices.length },
    { title: trans('dashboard.normal_device'), value: normalDeviceCount },
    { title: trans('dashboard.error_device'), value: abnormalDeviceCount }
  ];

  return (
    <>
      <Card title={trans("common.user")} value={numberOfUsers} type="users" />
      <Card title={trans("device.device")} value={devicesInfo} type="devices" />
      <Card title={trans("dashboard.total_pages")} value={totalPages || 0} type="pages" />
      <Card title={trans("dashboard.today_pages")} value={todayPages || 0} type="pages" />
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
        <p className={`truncate rounded-xl bg-white px-4 py-6 text-center text-2xl`} >
          {value}
        </p>
      }
      {typeof value === 'object' &&
        <div className="flex flex-col">
          {
            value.map((item, idx) => {
              if (idx === value.length - 1) {
                return (
                  <div key={idx} className="flex-1 flex justify-between truncate rounded-xl bg-white px-2 items-center" >
                    <div className="text-l">{item.title}</div>
                    <div className="text-2xl">{item.value}</div>
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="flex-1 flex justify-between truncate rounded-xl bg-white px-2 mb-2 items-center" >
                    <div className="text-l">{item.title}</div>
                    <div className="text-2xl">{item.value}</div>
                  </div>
                )
              }
            })
          }
        </div>
      }
    </div>
  );
}
