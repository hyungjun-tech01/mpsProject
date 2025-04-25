import type { Metadata } from "next";
import { Suspense } from "react";
import Link from 'next/link';
import { notFound } from "next/navigation";
import Search from '@/app/components/search';
import Table from '@/app/components/table';
// import { CreateButton } from '@/app/components/buttons';
import { TableSkeleton } from "@/app/components/skeletons";
import { IColumnData, ISearch } from '@/app/lib/definitions';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import { auth } from "@/auth"
import clsx from 'clsx';
import { LinkOutlined, LinkOffOutlined } from '@mui/icons-material';


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
    if(!session?.user)
        return notFound();

    const adapter = MyDBAdapter();
    const [t, totalPages, docs] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredDocumnetsPages(query, session?.user.name, category, itemsPerPage),
        adapter.getFilteredDocumnets(query, session?.user.name, category, itemsPerPage, currentPage),
    ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'fax', title: t('document.subTitle_fax'), link: `/document/fax` },
        { category: 'scan', title: t('document.subTitle_scan'), link: `/document/scan` },
    ];

    // Search Text ---------------------------------------------------------------------
    const groupTexts = {
        fax : {
            keySearchPlaceholder : t('document.search_placehodler_fax'),
        },
        scan : {
            keySearchPlaceholder : t('document.search_placehodler_scan'),
        },
    };

    const columns: IColumnData[] = [
        { name: 'archive_path', title: t('document.file'), align: 'center', type: 'file' },
        { name: 'created_date', title: t('document.created_date'), align: 'center', type: 'date' },
        { name: 'created_by', title: t('document.created_by'), align: 'center' },
        { name: 'device_name', title: t('document.used_device'), align: 'center' },
        { name: 'total_pages', title: t('logs.original_pages'), align: 'center' },
        { name: 'shared', title: t('document.shared'), align: 'center', type: 'enum_icon', values: { 'Y': <LinkOutlined/>, 'N': <LinkOffOutlined/>} },
    ];

    return (
        <div className='w-full flex-col justify-start'>
            <div className="pl-2">
            {subTitles.map(item => {
                return <Link key={item.category} href={item.link}
                    className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                        { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === category },
                        { "text-gray-300  bg-white border-2": item.category !== category },
                    )}>{item.title}</Link>;
            })}
            </div>
            <div className="w-full px-4 bg-gray-50 rounded-md">
                <div className="pt-4 flex items-center justify-between gap-2 md:pt-8">
                    <Search placeholder={groupTexts[category].keySearchPlaceholder} />
                </div>
                <Suspense fallback={<TableSkeleton />}>
                    <Table
                        columns={columns}
                        rows={docs}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        path='document'
                        locale={locale}
                        editable = {false}
                        deleteAction={adapter.deleteDocument}
                    />
                </Suspense>
            </div>
        </div>
    );
}