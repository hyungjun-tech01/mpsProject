import { Suspense } from "react";
import type { Metadata } from "next";
import Table from '@/app/components/log/table';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import Search from '@/app/components/search';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import { TableSkeleton } from "@/app/components/skeletons";
import AuditLogQuery from "@/app/components/log/auditLogQuery";



import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import
import { auth } from "@/auth";
import LogClient from '@/app/lib/logClient';


export const metadata: Metadata = {
    title: 'Logs',
}

interface IAuditLogParams {
    periodStart?:string,
    periodEnd?:string,
    query?: string,
    itemsPerPage?: string,
    page?: string,
  }

export default async function Page(props: {
    searchParams?: Promise<IAuditLogParams>;
    params: Promise<{ locale: "ko" | "en", category: string }>;
}) {
    const { locale } = await props.params;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();

    const params = await props.params;
    const periodStartParam = searchParams?.periodStart ?? null;
    const periodEndParam = searchParams?.periodEnd ?? null;


    const adapter = MyDBAdapter();
    const [t, auditlogPages, auditlogs] = await Promise.all([
        getDictionary(locale),
        adapter.getFilteredAuditLogsPages(query, itemsPerPage, periodStartParam, periodEndParam),
        adapter.getFilteredAuditLogs(query, itemsPerPage, currentPage,periodStartParam, periodEndParam)
    ]);

    const userName = session?.user.name ?? "";
    if (!userName) {
        // 여기서 redirect 함수를 사용해 리다이렉트 처리
        redirect('/login'); // '/login'으로 리다이렉트
        // notFound();
    };

    
    const subTitles = [
        { category: 'auditlogs', title: t('logs.auditlogs'), link: `/logs/auditlogs` }
    ];
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
        { name: 'document_name', title: t('logs.document_name'), align: 'center',  },
        
    ];

    return (
        <div className="w-full">
             <LogClient userName={userName} groupId='' query={query}   applicationPage='로그' applicationAction='조회'/>
            <div className="flex w-full items-center justify-between">
                <h1 className="text-2xl">{t('logs.auditlogs')}</h1>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                <AuditLogQuery 
                dateFrom={t('logs.dateFrom')}
                dateTo={t('logs.dateTo')}
                periodStart={periodStartParam}
                periodEnd={periodEndParam}
                />
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