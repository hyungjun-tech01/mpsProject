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

export const metadata: Metadata = {
    title: 'Settings',
}

export default async function Page(props: {
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

    const [t, regularExp] = await Promise.all([
        getDictionary(locale),
        //adapter.getFilteredRegularExpPages(query, itemsPerPage),
        adapter.getFilteredRegularExp(query, itemsPerPage, currentPage)
    ]);

    // Tabs ----------------------------------------------------------------------

    // Columns -------------------------------------------------------------------
    const regularExpColumns :  IColumnData[]  = [
            { name: 'security_name', title: t('settings.security_name'), align: 'center' },
            { name: 'security_type', title: t('settings.security_type'), align: 'center' },
            { name: 'security_word', title: t('settings.security_word'), align: 'center' },
            { name: 'created_by', title: t('settings.created_by'), align: 'center' },
            { name: 'creation_date', type: 'date', title: t('settings.creation_date'), align: 'center' },
        ];

    return (
        <div className='w-full flex-col justify-start'>
             <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t('settings.regularExprPrivateInfo')}</h1>
            </div>
           
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder={t('settings.regularExprPrivateInfoQueryCondition')}/>
                <CreateButton link="/settings/regularExpPrivateInfo/create" title={t("settings.create_regular")} />
                <button type="submit" className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-base font-medium text-white transition-colors hover:bg-lime-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-500">
                    {t("settings.dos")}
                </button>
            </div>

                <Suspense fallback={<TableSkeleton />}>
                    <Table
                        columns={regularExpColumns}
                        rows={regularExp}
                        currentPage={currentPage}
                        totalPages={1}
                        path={`/settings/regularExpPrivateInfo`}
                        locale={locale}
                        deleteAction={adapter.deleteGroup}
                        editable= {true}
                        deletable={true}
                    />
                </Suspense>
            
        </div>
    );
}