import { notFound } from 'next/navigation';
import MyDBAdapter from "@/app/lib/adapter";
import { auth } from "@/auth";
import Card from "./card";


export default async function CardWrapper({ trans }: { trans: (key: string) => string }) {
  const session = await auth();
  const adapter = MyDBAdapter();

  if (session?.user.role === "admin") {
    const [top5users, top5devices] =
      await Promise.all([
        adapter.getTop5UserFor30days(),
        adapter.getTop5DevicesFor30days(),
      ]);

    const top5userInfo = top5users.map(item => ({
      title: item.user_name, value: item.total_pages_sum
    }));

    const top5devicesInfo = top5devices.map(item => ({
      title: item.device_name, value: item.total_pages_sum
    }));

    return (
      <>
        <Card title={trans("dashboard.top5_users")} value={top5userInfo} type="users" />
        <Card title={trans("dashboard.top5_devices")} value={top5devicesInfo} type="devices" />
      </>
    );
  } else {
    return null;
  }
}
