import type { Metadata } from "next";
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import { DoNotDisturbOnOutlined, DoNotDisturbOffOutlined } from "@mui/icons-material";


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

    const adapter = MyDBAdapter();
    const [t, totalPages, users] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredUsersPages(query, itemsPerPage),
        adapter.getFilteredUsers(query, itemsPerPage, currentPage)
    ]);

    // const handleDelete = async (userId: string) => {
    //     'use server';
    //     await adapter.deleteUser(userId);
    //   };
    
    const columns: IColumnData[] = [
        { name: 'user_name', title: t('user.user_id'), align: 'center' },
        { name: 'full_name', title: t('user.user_name'), align: 'center' },
        { name: 'balance', title: t('account.balance'), align: 'center', type: 'currency' },
        { name: 'restricted', title: t('user.limited'), align: 'center', type: 'enum_icon', values: {Y: <DoNotDisturbOnOutlined/>, N: <DoNotDisturbOffOutlined/>} },
        { name: 'total_pages', title: t('common.page'), align: 'center' },
        { name: 'total_jobs', title: t('user.job'), align: 'center' },
    ];

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t("common.user")}</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder={t("comment.search_users")} />
                <CreateButton link="/user/create" title={t("user.create_user")} />
            </div>
            <Table
                columns={columns}
                rows={users}
                currentPage={currentPage}
                totalPages={totalPages}
                path='user'
                locale={locale}
                deleteAction={adapter.deleteUser}
                editable={true}
                deletable={true}
            />
        </div>
    );
}