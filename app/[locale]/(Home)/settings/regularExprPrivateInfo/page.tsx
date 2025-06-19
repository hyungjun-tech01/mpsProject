import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from 'next/navigation';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';
import MyDBAdapter from '@/app/lib/adapter';
import { auth } from "@/auth";
import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import
import LogClient from '@/app/lib/logClient';
import { TableSkeleton } from "@/app/components/skeletons";
import { CreateButton } from '@/app/components/buttons';
import { DosForm } from '@/app/components/settings/dosForm';

export const metadata: Metadata = {
    title: 'Settings',
}

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ process: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();

    const userName = session?.user.name ?? "";
    if (!userName) {
        // 여기서 redirect 함수를 사용해 리다이렉트 처리
        redirect('/login'); // '/login'으로 리다이렉트
        // notFound();
    };

   
    if(!session?.user) return notFound();
    if( session?.user.role !== 'admin') return notFound();

    const adapter = MyDBAdapter();

    const [t, totalPages, regularExp] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredRegularExpPages(query, itemsPerPage),
        adapter.getFilteredRegularExp(query, itemsPerPage, currentPage)
    ]);

    // Tabs ----------------------------------------------------------------------

    // Columns -------------------------------------------------------------------
    const regularExpColumns :  IColumnData[]  = [
            { name: 'security_name', title: t('settings.security_name'), align: 'center' },
            { name: 'security_type', title: t('settings.security_type'), align: 'center' },
            { name: 'security_word', title: t('settings.security_word'), align: 'center' },
            { name: 'created_by', title: t('settings.created_by'), align: 'center' },
            { name: 'creation_date', type: 'date_simple', title: t('settings.creation_date'), align: 'center' },
        ];

    return (
        <div className='w-full flex-col justify-start'>
            <LogClient userName={userName} groupId='' query={query}   applicationPage='정규식/보안단어' applicationAction='조회'/>
             <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t('settings.regularExprPrivateInfo')}</h1>
            </div>
           
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder={t('settings.regularExprPrivateInfoQueryCondition')}/>
                <CreateButton link="/settings/regularExprPrivateInfo/create" title={t("settings.create_regular")} />
                <DosForm label={t("settings.dos")} />
            </div>

                <Suspense fallback={<TableSkeleton />}>
                    <Table
                        columns={regularExpColumns}
                        rows={regularExp}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        path={`/settings/regularExpPrivateInfo`}
                        locale={locale}
                        deleteAction={adapter.deleteRegularExp}
                        editable= {true}
                        deletable={true}
                    />
                </Suspense>
            
        </div>
    );
}