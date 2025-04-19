import type { Metadata } from "next";
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import { DoNotDisturbOnOutlined, DoNotDisturbOffOutlined } from "@mui/icons-material";
import { auth } from '@/auth';
import { notFound } from "next/navigation";


export const metadata: Metadata = {
    title: 'Print',
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

    const session = await auth();
    if(!session?.user)
        return notFound();

    const adapter = MyDBAdapter();
    const [t, totalPages, prints] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredPrintSpoolPages(query, itemsPerPage),
        adapter.getFilteredPrintSpool(query, itemsPerPage, currentPage)
    ]);

    
    const columns: IColumnData[] = [
        { name: 'print_job_time', title: t('print.job_time'), align: 'center' },
        { name: 'print_document_name', title: t('document.document_name'), align: 'center' },
        { name: 'print_pc_ip', title: t('common.ip_address'), align: 'center' },
        { name: 'pages', title: t('print.pages'), align: 'center' },
        { name: 'copies', title: t('print.copies'), align: 'center' },
        { name: 'color_mode', title: t('print.color_mode'), align: 'center' },
        { name: 'duplex', title: t('print.duplex'), align: 'center' },
        { name: 'paper_size', title: t('print.paper_size'), align: 'center' },
    ];

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t("print.wating_list")}</h1>
            </div>
            <div className="flex justify-start mt-6">
                <div className="mr-12">
                    <button className="font-medium rounded-md bg-lime-700 text-white py-2 px-3 mr-2">
                        {t('print.print_all')}
                    </button>
                    <button className="font-medium rounded-md border-2 border-gray-200 text-gray-500 py-2 px-3">
                        {t('print.delete_all')}
                    </button>
                </div>
                <div>
                    <button className="font-medium rounded-md border-2 border-gray-200 text-gray-500 py-2 px-3 mr-2">
                        {t('print.print_checked')}
                    </button>
                    <button className="font-medium rounded-md border-2 border-gray-200 text-gray-500 py-2 px-3">
                        {t('print.delete_checked')}
                    </button>
                </div>
            </div>
            <Table
                columns={columns}
                rows={prints}
                currentPage={currentPage}
                totalPages={totalPages}
                path='user'
                locale={locale}
                deleteAction={adapter.deleteUser}
                editable={false}
                deletable={false}
                checkable={true}
            />
        </div>
    );
}