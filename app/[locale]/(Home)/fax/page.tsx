import type { Metadata } from "next";
import { Suspense } from 'react';
import getDictionary from '@/app/locales/dictionaries';
import { IEditItem } from '@/app/components/edit-items';
import { fetchFaxesPages, fetchFilteredFaxes } from '@/app/lib/fetchFaxData';
import { IColumnData } from '@/app/lib/definitions';
import { UserTableSkeleton } from '@/app/components/user/skeletons';
import Search from '@/app/components/search';
import { CreateButton } from '@/app/components/buttons';
import Table from '@/app/components/table';
import { deleteDevice } from '@/app/components/device/actions';
import Breadcrumbs from '@/app/components/breadcrumbs';
import LogTable from '@/app/components/table';
import Link from 'next/link';
import clsx from 'clsx';

export const metadata: Metadata = {
    title: 'Fax',
}

interface ISearchDevice {
    query?: string;
    itemsPerPage?: string;
    page?: string;
}


export default async function Fax(
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
        fetchFaxesPages(query, itemsPerPage),
        fetchFilteredFaxes(query, itemsPerPage, currentPage)
    ]);

    const columns: IColumnData[] = [
        { name: 'fax_line_id', title: t('device.fax_line_id') },
        { name: 'fax_line_name', title: t('device.fax_line_name'), align: 'center' },
        { name: 'printer_id', title: t('device.printer_id'), align: 'center' },
        { name: 'fax_line_user_id', title: t('device.fax_line_user_id'), align: 'center' },
        { name: 'fax_line_shared_group_id', title: t('device.fax_line_shared_group_id'), align: 'center' },
    ];
    return (
            <div className="w-full">
                <div className="flex w-full items-center justify-between">
                    <h1 className="text-2xl">{t('fax.fax')}</h1>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                    <Search placeholder="Search Fax..." />
                    <CreateButton link="/fax/create" title="Create Fax Line" />
                </div>
                <Table
                    columns={columns}
                    rows={devices}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    locale={locale}
                    category='device'
                    deleteAction={deleteDevice}
                />
            </div>
    );
}
