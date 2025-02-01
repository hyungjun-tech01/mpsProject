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
                    <h1 className="text-2xl">{t('device.device')}</h1>
                </div>
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
    );
}