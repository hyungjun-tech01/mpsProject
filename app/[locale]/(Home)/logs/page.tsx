import type { Metadata } from "next";
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import { deleteUser } from '@/app/lib/actions';
import { fetchFilteredDeviceUsageLogPages, fetchFilteredDeviceUsageLogs } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';


export const metadata: Metadata = {
    title: 'Logs',
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
    const [t, totalPages, logs] = await Promise.all([
        getDictionary(locale),
        fetchFilteredDeviceUsageLogPages(itemsPerPage),
        fetchFilteredDeviceUsageLogs(query, itemsPerPage, currentPage)
    ]);
    const subTitles = [
        { category: 'print_log', title: t('user.subTitle_detail'), link: `/logs/` },
        { category: 'app_log', title: t('user.subTitle_budget'), link: `/user/applogs` },
        { category: 'audit_log', title: t('user.subTitle_jobLog'), link: `/user/auditLog` }
    ];
    const columns: IColumnData[] = [
        { name: 'usage_date', title: t('printer.usage_date'), align: 'center', type: 'date' },
        { name: 'user_name', title: t('user.user_name'), align: 'center' },
        { name: 'display_name', title: t('printer.printer'), align: 'center', type: 'currency' },
        { name: 'total_pages', title: t('common.page'), align: 'center' },
        { name: 'usage_cost', title: t('printer.usage_cost'), align: 'center' },
        { name: 'document_name', title: t('printer.document_name'), align: 'center' },
        { name: 'property', title: t('printer.property'), align: 'center', type: 'list' },
        { name: 'status', title: t('printer.status'), align: 'center' },
    ];

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Users</h1>
            </div>
            <Table
                columns={columns}
                rows={logs}
                currentPage={currentPage}
                totalPages={totalPages}
                category='logs'
                locale={locale}
                deleteAction={deleteUser}
            />
        </div>
    );
}