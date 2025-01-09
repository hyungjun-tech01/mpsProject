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
        { name: 'user_id', title: t('user.user_id') },
        { name: 'user_name', title: t('user.user_name'), align: 'center' },
        { name: 'is_work', title: t('user.limited'), align: 'center' },
        { name: 'job_type', title: t('user.job') },
        { name: 'memo', title: t('user.memo'), align: 'center' },
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