import type { Metadata } from "next";
import Link from 'next/link';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
// import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import { deleteUser } from '@/app/lib/actions';
import { fetchFilteredDocumnets, fetchFilteredDocumnetPages } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';
import { notFound } from "next/navigation";
import { auth } from "@/auth"
import clsx from 'clsx';


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

    const [t, totalPages, docs] = await Promise.all([
        getDictionary(locale),
        fetchFilteredDocumnetPages(query, session?.user.name, category, itemsPerPage),
        fetchFilteredDocumnets(query, session?.user.name, category, itemsPerPage, currentPage),
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
        { name: 'archive_path', title: t('document.image'), align: 'center' },
        { name: 'created_date', title: t('document.created_date'), align: 'center', type: 'date' },
        { name: 'created_by', title: t('document.created_by'), align: 'center', type: 'currency' },
        { name: 'device_name', title: t('document.used_device'), align: 'center' },
        { name: 'total_pages', title: t('logs.original_pages'), align: 'center' },
        { name: 'shared', title: t('document.shared'), align: 'center' },
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
                <Table
                    columns={columns}
                    rows={docs}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    path='user'
                    locale={locale}
                    deleteAction={deleteUser}
                />
            </div>
        </div>
    );
}