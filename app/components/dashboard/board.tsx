import {
    AccountCircleOutlined,
    FileCopyOutlined,
    ErrorOutlined,
    PaidOutlined,
    PrintOutlined,
    WarningOutlined
} from "@mui/icons-material";
import clsx from 'clsx';
import { notFound } from 'next/navigation';
import MyDBAdapter from "@/app/lib/adapter";
import { auth } from "@/auth";
import Card from "./card";


const iconMap = {
    collected: PaidOutlined,
    users: AccountCircleOutlined,
    devices: PrintOutlined,
    pages: FileCopyOutlined,
    error: ErrorOutlined,
    warning: WarningOutlined,
};


export default async function BoardWrapper({ trans }: { trans: (key: string) => string }) {
    const session = await auth();
    const adapter = MyDBAdapter();
    const boardInfo: { title: string, value: string | number | object, type: string, color?: string }[] = [];

    const userName = session?.user.name;

    if (!userName) {
        notFound();
    };

    if (session?.user.role === "admin") {
        const [device_status, top5users, top5devices] =
            await Promise.all([
                adapter.getDevicesStatus(),
                adapter.getTop5UserFor30days(),
                adapter.getTop5DevicesFor30days(),
            ]);

        const normal_count = Number(device_status.normal_count);
        const error_count = Number(device_status.error_count);
        const warning_count = Number(device_status.warning_count);
        const low_supply_count = Number(device_status.low_supply_count);
        const offline_count = Number(device_status.offline_count);
        const total_count = normal_count + error_count + warning_count + low_supply_count + offline_count;

        const top5userInfo = top5users.map(item => ({
            title: item.user_name, value: item.total_pages_sum
        }));

        const top5devicesInfo = top5devices.map(item => ({
            title: item.device_name, value: item.total_pages_sum
        }));

        boardInfo.push({ title: trans("dashboard.total_device"), value: total_count, type: "devices" });
        boardInfo.push({ title: trans("dashboard.normal_device"), value: normal_count, type: "devices", color: "blue" });
        boardInfo.push({ title: trans("dashboard.error_device"), value: error_count, type: "error", color: "red" });
        boardInfo.push({ title: trans("dashboard.low_supply_device"), value: low_supply_count, type: "warning", color: "yellow" });

        return (
            <>
                <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
                    { boardInfo.map((item, idx) => {
                        const Icon = iconMap[item.type];
        
                        return (
                            <div key={idx} className="flex p-4 justify-between">
                                <div className="flex justify-start">
                                    {!!Icon && <Icon className={clsx("h-6 w-6", 
                                        {"text-gray-700": !item.color}, 
                                        {"text-red-500" : item.color === "red"},
                                        {"text-yellow-500" : item.color === "yellow"},
                                        {"text-blue-500" : item.color === "blue"},
                                        )} 
                                    />}
                                    <h3 className="ml-2 text-base text-sm">{item.title}</h3>
                                </div>
                                <div>{item.value}</div>
                            </div>
                        )
                    })}
                </div>
                <Card title={trans("dashboard.top5_users")} value={top5userInfo} type="users" />
                <Card title={trans("dashboard.top5_devices")} value={top5devicesInfo} type="devices" />
            </>
        )
    } else {
        const [myUsageStatus, myInfo] = await Promise.all([
            adapter.getUsageStatusByUser(userName),
            adapter.getUserByName(userName)
        ]);

        boardInfo.push({ title: trans("dashboard.total_job_count"), value: myUsageStatus.total_job_count || 0, type: "pages" });
        boardInfo.push({ title: trans("dashboard.total_pages"), value: myUsageStatus.copy_print_total_pages || 0, type: "pages" });
        boardInfo.push({ title: trans("account.balance"), value: myInfo.balance || 0, type: "collected" });

        return (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                { boardInfo.map((item, idx) => (
                    <Card key={idx} title={item.title} value={item.value} type={item.type} />
                ))}
            </div>
        )
    }
}
