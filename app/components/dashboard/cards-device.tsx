import { notFound } from 'next/navigation';
import MyDBAdapter from "@/app/lib/adapter";
import { auth } from "@/auth";
import Card from "./card";


export default async function CardWrapper({ trans }: { trans: (key: string) => string }) {
  const session = await auth();
  const adapter = MyDBAdapter();

  if (session?.user.role === "admin") {
    const device_status = await adapter.getDevicesStatus();

    const normal_count = Number(device_status.normal_count);
    const error_count = Number(device_status.error_count);
    const warning_count = Number(device_status.warning_count);
    const low_supply_count = Number(device_status.low_supply_count);
    const offline_count = Number(device_status.offline_count);
    const total_count = normal_count + error_count + warning_count + low_supply_count + offline_count;

    return (
      <>
        <Card title={trans("dashboard.total_device")} value={total_count} type="devices" />
        <Card title={trans("dashboard.normal_device")} value={normal_count} type="devices" color="blue"/>
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

