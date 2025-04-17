import { notFound } from 'next/navigation';
import {
  PaidOutlined,
  AccountCircleOutlined,
  PrintOutlined,
  FileCopyOutlined,
  ErrorOutlined,
  WarningOutlined
} from "@mui/icons-material";
import MyDBAdapter from "@/app/lib/adapter";
import { auth } from "@/auth";
import clsx from 'clsx';


const iconMap = {
  collected: PaidOutlined,
  users: AccountCircleOutlined,
  devices: PrintOutlined,
  pages: FileCopyOutlined,
  error: ErrorOutlined,
  warning: WarningOutlined
};


export default async function CardWrapper({ trans }: { trans: (key: string) => string }) {
  const session = await auth();
  const adapter = MyDBAdapter();

  if (session?.user.role === "admin") {
    const [numberOfUsers, device_status, totalPages, todayPages, latestDeviceStatus] =
      await Promise.all([
        adapter.getUserCount(),
        adapter.getDevicesStatus(),
        adapter.getAllTotalPageSum(),
        adapter.getTodayTotalPageSum(),
        adapter.getLatestDeviceStatus(),
      ]);

    const normal_count = Number(device_status.normal_count);
    const error_count = Number(device_status.error_count);
    const warning_count = Number(device_status.warning_count);
    const low_supply_count = Number(device_status.low_supply_count);
    const offline_count = Number(device_status.offline_count);
    const total_count = normal_count + error_count + warning_count + low_supply_count + offline_count;

    // const devicesInfo = [
    //   { title: trans('dashboard.total_device'), value: total_count },
    //   { title: trans('dashboard.normal_device'), value: normal_count },
    //   { title: trans('dashboard.error_device'), value: error_count },
    //   { title: trans('dashboard.low_supply_device'), value: low_supply_count },
    // ];

    // if(warning_count)
    //   devicesInfo.push({ title: trans('dashboard.warning_device'), value: warning_count });

    // if(offline_count > 0)
    //   devicesInfo.push({ title: trans('dashboard.offline_device'), value: offline_count });

    return (
      <>
        <Card title={trans("dashboard.total_device")} value={total_count} type="devices" />
        <Card title={trans("dashboard.normal_device")} value={normal_count} type="devices" />
        <Card title={trans("dashboard.error_device")} value={error_count} type="error" color="red" />
        <Card title={trans("dashboard.low_supply_device")} value={low_supply_count} type="warning" color="yellow"/>
      </>
    );
  } else {
    const userName = session?.user.name;

    if(!userName) {
      notFound();
    };

    const [myUsageStatus, myInfo] = await Promise.all([
      adapter.getUsageStatusByUser(userName),
      adapter.getUserByName(userName)
    ]);

    return (
      <>
        <Card title={trans("dashboard.total_job_count")} value={myUsageStatus.total_job_count || 0} type="pages" />
        <Card title={trans("dashboard.total_pages")} value={myUsageStatus.copy_print_total_pages || 0} type="pages" />
        <Card title={trans("account.balance")} value={myInfo.balance || 0} type="pages" />
      </>
    );
  }
}

export function Card({
  title,
  value,
  type,
  color,
}: {
  title: string;
  value: number | string | object;
  type: "users" | "devices" | "pages" | "collected" | "error" | "warning";
  color?: string;
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {!!Icon && <Icon className={clsx("h-6 w-6", 
            {"text-gray-700": !color}, 
            {"text-red-500" : color === "red"},
            {"text-yellow-500" : color === "yellow"}
          )} 
        />}
        <h3 className="ml-2 text-base font-medium">{title}</h3>
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
                    <div className="text-lg">{item.title}</div>
                    <div className="text-2xl">{item.value}</div>
                  </div>
                );
              } else {
                return (
                  <div key={idx} className="flex-1 flex justify-between truncate rounded-xl bg-white px-2 mb-2 items-center" >
                    <div className="text-lg">{item.title}</div>
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
