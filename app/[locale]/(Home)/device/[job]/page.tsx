import type { Metadata } from "next";
import { Suspense } from 'react';
import getDictionary from '@/app/locales/dictionaries';
import { IEditItem } from '@/app/components/edit-items';
import { fetchDevicesPages, fetchFilteredDevices } from '@/app/lib/fetchDeviceData';
import { IColumnData } from '@/app/lib/definitions';
import { UserTableSkeleton } from '@/app/components/user/skeletons';
import Search from '@/app/components/search';
import { CreateButton } from '@/app/components/buttons';
import Table from '@/app/components/table';
import { deleteUser } from '@/app/lib/actions';
import Breadcrumbs from '@/app/components/user/breadcrumbs';
import LogTable from '@/app/components/table';
import Link from 'next/link';
import clsx from 'clsx';

export const metadata: Metadata = {
    title: 'Device',
}

interface ISearchDevice {
    query?: string;
    itemsPerPage?: string;
    page?: string;
}


export default async function Device(
    props: { 
        searchParams?: Promise<ISearchDevice>;
        params: Promise<{  job: string,  locale: "ko" | "en" }>;
    }
){
    const params = await props.params;
    const locale = params.locale;
    const job = params.job;

    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const [t, totalPages, devices] = await Promise.all([
        getDictionary(locale),
        fetchDevicesPages(query, itemsPerPage),
        fetchFilteredDevices(query, itemsPerPage, currentPage)
    ]);

    const subTitles = [
        { category: 'external_device_list', title: t('device.external_device_list'), link: `/device/external_device_list` },
        { category: 'scan_actions', title: t('device.scan_actions'), link: `/device/scan_actions` },
        { category: 'scan_notifications ', title: t('device.scan_notifications'), link: `/device/scan_notifications` },
    ];
    const items: { scan_actions: IEditItem[], scan_notifications: IEditItem[]} = {
        scan_actions: [
            { name: 'device_name', title: t('device.device_name'), type: 'label', defaultValue: devices.printer_name },
            { name: 'device_type', title: t('device.device_type'), type: 'input', defaultValue: devices.device_type, placeholder: t('devices.device_type') },
            { name: 'ext_device_function', title: t('device.ext_device_function'), type: 'input', defaultValue: devices.ext_device_function, placeholder: t('devices.ext_device_function') },
            { name: 'server_name', title: t('device.server_name'), type: 'input', defaultValue: devices.server_name, placeholder: t('devices.server_name') },
            { name: 'deleted', title: t('device.deleted'), type: 'input', defaultValue: devices.deleted, placeholder: t('devices.placeholder_depadeletedrtment') },
        ],
        scan_notifications: [
            { name: 'device_name', title: t('device.device_name'), type: 'label', defaultValue: devices.printer_name },
            { name: 'device_type', title: t('device.device_type'), type: 'input', defaultValue: devices.device_type, placeholder: t('devices.device_type') },
            { name: 'ext_device_function', title: t('device.ext_device_function'), type: 'input', defaultValue: devices.ext_device_function, placeholder: t('devices.ext_device_function') },
            { name: 'server_name', title: t('device.server_name'), type: 'input', defaultValue: devices.server_name, placeholder: t('devices.server_name') },
            { name: 'deleted', title: t('device.deleted'), type: 'input', defaultValue: devices.deleted, placeholder: t('devices.placeholder_depadeletedrtment') },
        ],
    }
    const columns: IColumnData[] = [
        { name: 'printer_name', title: t('device.printer_name') },
        { name: 'device_type', title: t('device.device_type'), align: 'center' },
        { name: 'ext_device_function', title: t('device.ext_device_function'), align: 'center' },
        { name: 'server_name', title: t('device.server_name'), align: 'center' },
        { name: 'deleted', title: t('device.status'), align: 'center' },
    ];
        

    return (
        <main>
             <Breadcrumbs
                breadcrumbs={[
                    { label: t('device.device'), href: '/device/external_device_list' },
                    {
                        label: `/ ${job}`,
                        href: `/device/${job}`,
                        active: true,
                    },
                ]}
            />
            <div className='w-full pl-2 flex justify-start'>
                {subTitles.map((item, idx) => {
                    console.log(idx);
                    return <Link key={idx} href={item.link}
                        className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                            { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === job },
                            { "text-gray-300  bg-white border-2": item.category !== job },
                        )}>{item.title}</Link>;
                })}
            </div>
            {job === 'external_device_list' &&
                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                        <Search placeholder="Search Devices..." />
                        <CreateButton link="/device/create" title="Create Device" />
                    </div>
                    <Table
                        columns={columns}
                        rows={devices}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        editable={false}
                    />
                </div>
            }
            {job === 'scan_actions' &&
                <div>
                    Scan Action
                </div>
            }
            {job === 'scan_notifications' &&
                <div>
                    Scan Notification
                </div>
            }
        </main>
    );
}