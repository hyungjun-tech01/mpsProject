import { Suspense } from 'react';
import type { Metadata } from "next";
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateUser } from '@/app/components/user/buttons';
import { TableSkeleton } from '@/app/components/skeletons';
import { IColumnData } from '@/app/lib/definitions';
import { fetchUsersPages, fetchFilteredUsers } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';


export const metadata: Metadata = {
    title: 'Users',
}

interface ISearchUser {
    query?: string;
    itemsPerPage?: string;
    page?: string;
}

export default async function Page(props: {
    searchParams?: Promise<ISearchUser>;
    params: Promise<{ locale: "ko" | "en" }>;
}) {
    const locale = (await props.params).locale;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const [t, totalPages, users] = await Promise.all([
        getDictionary(locale),
        fetchUsersPages(query, itemsPerPage),
        fetchFilteredUsers(query, itemsPerPage, currentPage)
    ]);
    const columns: IColumnData[] = [
        { name: 'user_name', title: t('user.user_name') },
        { name: 'user_name_en', title: t('user.user_name_en') },
        { name: 'ceo_name', title: t('user.ceo_name'), align: 'center' },
        { name: 'user_address', title: t('user.address') },
        { name: 'business_registration_code', title: t('user.business_registration_code'), align: 'center' },
        { name: 'site_id', title: t('common.site_id'), align: 'center' },
        { name: 'sales_resource', title: t('user.salesman'), align: 'center' },
    ];

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Users</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search users..." />
                <CreateUser />
            </div>
            <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
                <Table
                    columns={columns}
                    rows={users}
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
            </Suspense>
        </div>
    );
}