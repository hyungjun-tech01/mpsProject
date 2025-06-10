import { Suspense } from "react";
import type { Metadata } from "next";
// import Link from 'next/link';
// import clsx from 'clsx';
import Table from '@/app/components/log/table';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import Search from '@/app/components/search';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import { TableSkeleton } from "@/app/components/skeletons";



import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import
import { auth } from "@/auth";
import LogClient from '@/app/lib/logClient';


export const metadata: Metadata = {
    title: 'Logs',
}

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ locale: "ko" | "en", category: string }>;
}) {
    const { locale, category } = await props.params;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();

    const startDate = new Date();
    const endDate  = new Date();

    const adapter = MyDBAdapter();
    const [t, /* printlogPages, printlogs, applogPages, applogs,*/ auditlogPages, auditlogs] = await Promise.all([
        getDictionary(locale),
        //fetchFilteredDeviceUsageLogPages(itemsPerPage),
        //fetchFilteredDeviceUsageLogs(query, itemsPerPage, currentPage),
        //fetchFilteredApplicationLogPages(itemsPerPage),
        //fetchFilteredApplicationLogs(itemsPerPage, currentPage),
        adapter.getFilteredAuditLogsPages(query, itemsPerPage),
        adapter.getFilteredAuditLogs(query, itemsPerPage, currentPage)
    ]);

    const userName = session?.user.name ?? "";
    if (!userName) {
        // 여기서 redirect 함수를 사용해 리다이렉트 처리
        redirect('/login'); // '/login'으로 리다이렉트
        // notFound();
    };

    
    const subTitles = [
     //   { category: 'printlogs', title: t('logs.printlogs'), link: `/logs/printlogs` },
     //   { category: 'applogs', title: t('logs.applogs'), link: `/logs/applogs` },
        { category: 'auditlogs', title: t('logs.auditlogs'), link: `/logs/auditlogs` }
    ];
    // const printlogColumns: IColumnData[] = [
    //     { name: 'usage_date', title: t('printer.usage_date'), align: 'center', type: 'date' },
    //     { name: 'user_name', title: t('user.user_name'), align: 'center' },
    //     { name: 'display_name', title: t('printer.printer'), align: 'center', type: 'currency' },
    //     { name: 'total_pages', title: t('common.page'), align: 'center' },
    //     { name: 'usage_cost', title: t('printer.usage_cost'), align: 'center' },
    //     { name: 'document_name', title: t('printer.document_name'), align: 'center' },
    //     { name: 'property', title: t('printer.property'), align: 'center', type: 'list' },
    //     { name: 'status', title: t('printer.status'), align: 'center' },
    // ];
    // const applogColumns: IColumnData[] = [
    //     { name: 'log_date', title: t('common.date'), align: 'center', type: 'date' },
    //     { name: 'server_name', title: t('logs.server_name'), align: 'center' },
    //     { name: 'log_level', title: t('logs.log_level'), align: 'center',  },
    //     { name: 'message', title: t('common.message'), align: 'left' },
    // ];
    const auditlogColumns: IColumnData[] = [
        { name: 'image_archive_path', title: t('logs.image'), align: 'center', type:'auditLogImage' },
        { name: 'send_date', title: t('logs.send_date'), align: 'center' ,  type:'auditLogDate'},
        { name: 'user_name', title: t('logs.user_name'), align: 'center' },
        { name: 'destination', title: t('logs.destination'), align: 'center',  },
        { name: 'printer_serial_number', title: t('logs.serial_number'), align: 'center',  },
        { name: 'copies', title: t('logs.copies'), align: 'center',  },
        { name: 'original_pages', title: t('logs.original_pages'), align: 'center',  },
        { name: 'total_pages', title: t('logs.total_pages'), align: 'center',  }, 
        { name: 'color_total_pages', title: t('logs.color_total_pages'), align: 'center',  }, 
        { name: 'detect_privacy', title: t('logs.detect_privacy'), align: 'center',  },
        { name: 'privacy_text', title: t('logs.privacy_text'), align: 'center',  },
    ];

    return (
        <div className="w-full">
             <LogClient userName={userName} groupId='' query={query}   applicationPage='로그' applicationAction='조회'/>
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t('logs.auditlogs')}</h1>
            </div>
            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <Search placeholder={t('logs.query_condition')}/>
            </div>
            <Suspense fallback={<TableSkeleton />}>
                <Table
                    columns={auditlogColumns}
                    rows={auditlogs}
                    currentPage={currentPage}
                    totalPages={auditlogPages}
                    locale={locale}
                    path='auditlogs'
                    editable={false}
                />
            </Suspense>
        </div>
    );
}