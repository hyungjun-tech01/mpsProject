import { Suspense } from "react";
import type { Metadata } from "next";
import Search from '@/app/components/search';
import Table from '@/app/components/settings/table';
import { FileUpload } from '@/app/components/settings/file-upload-form';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';
import MyDBAdapter from '@/app/lib/adapter';
import { auth } from "@/auth";
import LogClient from '@/app/lib/logClient';
import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import
import { TableSkeleton } from "@/app/components/skeletons";


export const metadata: Metadata = {
    title: 'Settings/Register Users',
}

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    
    const session = await auth();

    if(!session?.user.id || !session?.user.name) {
        redirect('/login'); // '/login'으로 리다이렉트
    };

    const userId = session.user.id;
    const userName = session.user.name;

    const adapter = MyDBAdapter();
    const [t, settingData, settingDataPages] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredIFUsers(query, itemsPerPage, currentPage),
        adapter.getFilteredIFUserPages(query, itemsPerPage)
    ]);

    // Columns -------------------------------------------------------------------
    const registerUsersColumns : IColumnData[] = [
        { name: 'user_name', title: t('user.user_id'), align: 'center' },
        { name: 'full_name', title: t('user.user_name'), align: 'center' },
        { name: 'email', title: t('common.email'), align: 'center' },
        { name: 'home_directory', title: t('user.home_directory'), align: 'center' },
        { name: 'department', title: t('user.department'), align: 'center' },
        { name: 'card_number', title: t('user.card_number'), align: 'center' },
        { name: 'card_number2', title: t('user.card_number2'), align: 'center' },
        { name: 'created_date', title: t('common.created'), align: 'center', type: 'date' },
        { name: 'user_source_type', title: t('common.create_method'), align: 'center' },
        { name: 'if_status', title: t('common.status'), align: 'center' },
        { name: 'if_message', title: t('common.message'), align: 'left' },
    ];

    return (
        <div className='w-full flex-col justify-start'>
            <LogClient userName={userName} groupId='' query={query}   applicationPage='설정/사용자일괄등록' applicationAction='조회'/>
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t("settings.registerUsers")}</h1>
            </div>
            <div className="w-full px-4 pb-4 rounded-md">
                <div className="pt-4 flex flex-col gap-2 md:pt-8">
                    <FileUpload 
                        userId={userId}
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
                            <Search placeholder={t("comment.search_users")} />
                        </div>
                        <Suspense fallback={<TableSkeleton />}>
                            <Table
                                columns={registerUsersColumns}
                                rows={settingData}
                                totalPages={settingDataPages}
                                locale={locale}
                                action={adapter.submitSelectedUsers}
                                deleteAction={adapter.deleteUserInIF}
                            />
                        </Suspense>
                    </div>
                }
            </div>
        </div>
    );
}