import { Suspense } from "react";
import type { Metadata } from "next";
import Table from '@/app/components/print/table';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import { auth } from '@/auth';
import { notFound } from "next/navigation";
import { TableSkeleton } from "@/app/components/skeletons";


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

    const trans = {
        deleteAll : t('print.delete_all'),
        deleteChecked: t('print.delete_checked'),
        printAll : t('print.print_all'),
        printChecked: t('print.print_checked'),
    };

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t("print.waiting_list")}</h1>
            </div>
            <Suspense fallback={<TableSkeleton />}>
                <Table
                    columns={columns}
                    rows={prints}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    path='user'
                    t={trans}
                    checkable={true}
                    printAction={adapter.printSelectedPrint}
                    deleteAction={adapter.deleteSelectedPrint}
                />
            </Suspense>
        </div>
    );
}