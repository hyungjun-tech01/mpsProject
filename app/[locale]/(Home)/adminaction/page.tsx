import { Suspense } from "react";
import type { Metadata } from "next";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { FileUpload } from '@/app/components/settings/file-upload-form';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';
import MyDBAdapter from '@/app/lib/adapter';
import { auth } from "@/auth";
import clsx from 'clsx';
import { TableSkeleton } from "@/app/components/skeletons";
import { CreateButton } from '@/app/components/buttons';
import { executeDos } from '@/app/lib/executeDos'; 
import { DosForm } from '@/app/components/settings/dosForm';

export const metadata: Metadata = {
    title: 'Admin Action Log',
}

export default async function AdminActionLog(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ process: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const process = params.process;
    const locale = params.locale;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();

   
    if(!session?.user) return notFound();
    if( session?.user.role !== 'admin') return notFound();

    const adapter = MyDBAdapter();

    const [t, totalPages, applicationLog] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredApplicationLogPages(query, itemsPerPage),
        adapter.getFilteredApplicationLog(query, itemsPerPage, currentPage)
    ]);

    // Tabs ----------------------------------------------------------------------

    // Columns -------------------------------------------------------------------
    const regularExpColumns :  IColumnData[]  = [
            { name: 'log_date', type: 'date_simple', title: t('adminActionLog.creation_date'), align: 'center' },
            { name: 'created_by', title: t('adminActionLog.created_by'), align: 'center' },
            { name: 'application_page', title: t('adminActionLog.path'), align: 'center' },
            { name: 'application_parameter', title: t('adminActionLog.parameter'), align: 'center' },
            { name: 'application_action', title: t('adminActionLog.action'), align: 'center' },
            { name: 'ip_address', title: t('adminActionLog.ip_address'), align: 'center' },
        ];

    return (
        <div className='w-full flex-col justify-start'>
             <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t('adminActionLog.adminActionLog')}</h1>
            </div>
           
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder={t('adminActionLog.query_placehold')}/>
            </div>

                <Suspense fallback={<TableSkeleton />}>
                    <Table
                        columns={regularExpColumns}
                        rows={applicationLog}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        path={`/adminaction`}
                        locale={locale}
                        deleteAction={adapter.deleteRegularExp}
                        editable= {false}
                        deletable={false}
                    />
                </Suspense>
            
        </div>
    );
}