import { Suspense } from "react";
import type { Metadata } from "next";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { FileUpload } from '@/app/components/settings/file-upload-form';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';
import MyDBAdapter from '@/app/lib/adapter';
import { auth } from "@/auth";
import clsx from 'clsx';
import { TableSkeleton } from "@/app/components/skeletons";


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
    const [t, settingData, settingDataPages] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredIFUsers(query, itemsPerPage, currentPage),
        adapter.getFilteredIFUserPages(query, itemsPerPage)
    ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'registerUsers', title: t('settings.registerUsers'), link: `/settings/registerUsers` },
    ];

    // Columns -------------------------------------------------------------------
    const processColumns : { registerUsers: IColumnData[] } = {
        registerUsers: [
            { name: 'user_name', title: t('user.user_id'), align: 'center' },
            { name: 'full_name', title: t('user.user_name'), align: 'center' },
            { name: 'email', title: t('common.email'), align: 'center' },
            { name: 'home_directory', title: t('user.home_directory'), align: 'center' },
            { name: 'department', title: t('user.department'), align: 'center' },
            { name: 'card_number', title: t('user.card_number'), align: 'center' },
            { name: 'card_number2', title: t('user.card_number2'), align: 'center' },
            { name: 'created', title: t('common.created'), align: 'center' },
            { name: 'create_method', title: t('common.create_method'), align: 'center' },
            { name: 'message', title: t('common.message'), align: 'left' },
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
            <div className="w-full px-4 pb-4 bg-gray-50 rounded-md">
                <div className="pt-4 flex flex-col gap-2 md:pt-8">
                    <FileUpload 
                        title={t('user.import_csv_file')}
                        button_title={t('common.browse_file')}
                        detail_comment={t('comment.click_drag_file_upload')}
                        accepted={{'text/plain': ['.csv']}} 
                        action={adapter.batchCreateUser}
                    />
                </div>
                {settingData.length > 0 && 
                    <div className="pt-4 flex flex-col gap-2 md:pt-8">
                        <div className="pt-4 flex items-center justify-between gap-2">
                            <Search placeholder={""} />
                        </div>
                        <Suspense fallback={<TableSkeleton />}>
                            <Table
                                columns={processColumns[process]}
                                rows={settingData}
                                currentPage={currentPage}
                                totalPages={settingDataPages}
                                path="/"
                                locale={locale}
                                deleteAction={adapter.deleteGroup}
                                checkable
                                editable={false}
                            />
                        </Suspense>
                    </div>
                }
            </div>
        </div>
    );
}