import type { Metadata } from "next";
import { Suspense } from 'react';
import getDictionary from '@/app/locales/dictionaries';
import { IEditItem } from '@/app/components/edit-items';
import { fetchDevicesPages, fetchFilteredDevices } from '@/app/lib/fetchDeviceData';
import { IColumnData } from '@/app/lib/definitions';
import { TableSkeleton } from '@/app/components/skeletons';
import Search from '@/app/components/search';
import { CreateButton } from '@/app/components/buttons';
import Table from '@/app/components/table';
import { deleteUser } from '@/app/lib/actions';

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
        params: Promise<{ locale: "ko" | "en" }>;
    }
){

    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const params = await props.params;
    const locale = params.locale;
    const [t, totalPages, users] = await Promise.all([
        getDictionary(locale),
        fetchDevicesPages(query, itemsPerPage),
        fetchFilteredDevices(query, itemsPerPage, currentPage)
    ]);

    const subTitles = [
        { category: 'external_device_list', title: t('device.external_device_list'), link: `/device/external_device_list` },
        { category: 'scan_actions', title: t('device.scan_actions'), link: `/user/scan_actions` },
        { category: 'scan_notifications ', title: t('device.scan_notifications'), link: `/user/scan_notification` },
    ];
    const items: { external_device_list: IEditItem[]} = {
        external_device_list: [
            { name: 'device_name', title: t('device.device_name'), type: 'label', defaultValue: users.user_name },
            { name: 'full_name', title: t('user.full_name'), type: 'input', defaultValue: users.full_name, placeholder: t('user.placeholder_full_name') },
            { name: 'email', title: t('common.email'), type: 'input', defaultValue: users.email, placeholder: t('user.placeholder_email') },
            { name: 'home_directory', title: t('user.home_directory'), type: 'input', defaultValue: users.home_directory, placeholder: t('user.placeholder_home_directory') },
            {
                name: 'disabled_printing', title: t('user.enable_disable_printing'), type: 'select', defaultValue: users.disabled_printing, options: [
                    { title: t('user.enable_printing'), value: 'N' },
                    { title: t('user.disable_printing'), value: 'Y' }
                ]
            },
            { name: 'department', title: t('user.department'), type: 'input', defaultValue: users.department, placeholder: t('user.placeholder_department') },
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
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Devices</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search devices..." />
                <CreateButton link="/user/create" title="Create User"/>
            </div>
            <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
                <Table
                    columns={columns}
                    rows={users}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    category='device'
                    deleteAction={deleteUser}
                />
            </Suspense>
        </div>
    );
}