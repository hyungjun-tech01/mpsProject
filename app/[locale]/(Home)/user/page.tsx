import type { Metadata } from "next";
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import { deleteUser } from '@/app/lib/actions';
import { fetchUsersPages, fetchFilteredUsers } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';


export const metadata: Metadata = {
    title: 'Users',
}


export default async function Page(props: {
    searchParams?: Promise<ISearch>;
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
        { name: 'user_name', title: t('user.user_id'), align: 'center' },
        { name: 'full_name', title: t('user.user_name'), align: 'center' },
        { name: 'balance', title: t('account.balance'), align: 'center', type: 'currency' },
        { name: 'restricted', title: t('user.limited'), align: 'center' },
        { name: 'total_pages', title: t('common.page'), align: 'center' },
        { name: 'total_jobs', title: t('user.job'), align: 'center' },
    ];

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Users</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search users..." />
                <CreateButton link="/user/create" title="Create User" />
            </div>
            <Table
                columns={columns}
                rows={users}
                currentPage={currentPage}
                totalPages={totalPages}
                category='user'
                locale={locale}
                deleteAction={deleteUser}
            />
        </div>
    );
}