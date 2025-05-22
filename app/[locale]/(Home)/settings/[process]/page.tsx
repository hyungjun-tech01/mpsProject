import { Suspense } from "react";
import type { Metadata } from "next";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { TableSkeleton } from "@/app/components/skeletons";
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';
import MyDBAdapter from '@/app/lib/adapter';
import { auth } from "@/auth";
import clsx from 'clsx';


export const metadata: Metadata = {
    title: 'Settings',
}

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ process: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const process = params.process;
    const locale = params.locale;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();

    if (!['registerUsers' ].includes(process)) {
        notFound();
    };

    if(!session?.user) return notFound();
    if( session?.user.role !== 'admin') return notFound();

    const adapter = MyDBAdapter();
    const [t] = await Promise.all([
        getDictionary(locale)
    ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'registerUsers', title: t('settings.registerUsers'), link: `/settings/registerUsers` },
    ];

    // Search Text ---------------------------------------------------------------------
    // const groupTexts = {
    //     registerUsers : {
    //         keySearchPlaceholder : t('group.search_placehodler_device'),
    //     },
    //     user : {
    //         keySearchPlaceholder : t('group.search_placehodler_user'),
    //     },
    //     security : {
    //         keySearchPlaceholder : t('group.search_placehodler_security'),
    //     }
    // };

    // Columns -------------------------------------------------------------------
    const processColumns : { registerUsers: IColumnData[] } = {
        registerUsers: [
            { name: 'group_name', title: t('group.group_name'), align: 'center' },
            { name: 'device_count', title: t('group.device_count'), align: 'center' },
            { name: 'created_date', title: t('common.created'), align: 'center', type: 'date' },
        ]
    };

    return (
        <div className='w-full flex-col justify-start'>
            <div className="pl-2">
            {subTitles.map(item => {
                return <Link key={item.category} href={item.link}
                    className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                        { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === process },
                        { "text-gray-300  bg-white border-2": item.category !== process },
                    )}>{item.title}</Link>;
            })}
            </div>
            <div className="w-full px-4 bg-gray-50 rounded-md">
                <div className="pt-4 flex items-center justify-between gap-2 md:pt-8">
                    <Search placeholder={""} />
                </div>
                {/* <Suspense fallback={<TableSkeleton />}>
                    <Table
                        columns={groupColumns[group]}
                        rows={groupData}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        path={`/group/${group}`}
                        locale={locale}
                        deleteAction={adapter.deleteGroup}
                        editable={!!isAdmin}
                        deletable={!!isAdmin}
                    />
                </Suspense> */}
            </div>
        </div>
    );
}