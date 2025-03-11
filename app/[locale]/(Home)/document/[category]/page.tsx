import type { Metadata } from "next";
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import { deleteUser } from '@/app/lib/actions';
import { fetchFilteredDocumnets, fetchFilteredDocumnetPages } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';
import { notFound } from "next/navigation";
import { auth } from "@/auth"


export const metadata: Metadata = {
    title: 'Documnets',
}

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ category: "fax" | "scan", locale: "ko" | "en" }>;
}) {
    const {locale, category} = (await props.params);
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();

    if(!session?.user) return notFound();

    const [t, totalPages, users] = await Promise.all([
        getDictionary(locale),
        fetchFilteredDocumnetPages(query, session?.user.name, category, itemsPerPage),
        fetchFilteredDocumnets(query, session?.user.name, category, itemsPerPage, currentPage),
    ]);
    const columns: IColumnData[] = [
        { name: 'archive_path', title: t('document.image'), align: 'center' },
        { name: 'created_date', title: t('document.created_date'), align: 'center' },
        { name: 'created_by', title: t('document.created_by'), align: 'center', type: 'currency' },
        { name: 'device_name', title: t('document.used_device'), align: 'center' },
        { name: 'total_pages', title: t('logs.original_pages'), align: 'center' },
        { name: 'shared', title: t('document.shared'), align: 'center' },
    ];

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">Documents</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder="Search document..." />
            </div>
            <Table
                columns={columns}
                rows={users}
                currentPage={currentPage}
                totalPages={totalPages}
                path='user'
                locale={locale}
                deleteAction={deleteUser}
            />
        </div>
    );
}