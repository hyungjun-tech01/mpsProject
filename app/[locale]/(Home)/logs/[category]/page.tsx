import { Suspense } from "react";
import type { Metadata } from "next";
import Link from 'next/link';
import clsx from 'clsx';
import { notFound } from 'next/navigation';
import LogTable from '@/app/components/log/table';
import Table from '@/app/components/table';
import { IColumnData } from '@/app/lib/definitions';
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
    const { locale, category  } = await props.params;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const session = await auth();

    const periodStartParam = searchParams?.periodStart ?? null;
    const periodEndParam = searchParams?.periodEnd ?? null;;

    const userName = session?.user.name ?? "";
    if(!userName) redirect('/login'); // '/login'으로 리다이렉트
    if( session?.user.role !== 'admin') return notFound();

    if (!['auditlogs', 'auditlogsRetired', 'adminActionLogs'].includes(category)) {
        notFound();
    };

    const adapter = MyDBAdapter();

    let logPagesPromise;
    let logDataPromise;

    if (category === "auditlogs") {
        logPagesPromise = adapter.getFilteredAuditLogsPages(query, itemsPerPage, periodStartParam, periodEndParam);
        logDataPromise = adapter.getFilteredAuditLogs(query, itemsPerPage, currentPage, periodStartParam, periodEndParam);
    } else if (category === "auditlogsRetired") {
        logPagesPromise = adapter.getFilteredRetiredAuditLogsPages(query, itemsPerPage, periodStartParam, periodEndParam);
        logDataPromise = adapter.getFilteredRetiredAuditLogs(query, itemsPerPage, currentPage, periodStartParam, periodEndParam);
    } else {
    // application logs
        logPagesPromise = adapter.getFilteredApplicationLogPages(query, itemsPerPage, periodStartParam, periodEndParam);
        logDataPromise = adapter.getFilteredApplicationLog(query, itemsPerPage, currentPage, periodStartParam, periodEndParam);
    }

    const [t, logPages, logData] = await Promise.all([
        getDictionary(locale),
        logPagesPromise,
        logDataPromise
      ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'auditlogs', title: t('logs.auditlogs'), link: `/logs/auditlogs` },
        { category: 'auditlogsRetired', title: t('logs.auditlogsRetired'), link: `/logs/auditlogsRetired` },
        { category: 'adminActionLogs', title: t('adminActionLog.adminActionLog'), link: `/logs/adminActionLogs` },
    ];

    // Search Text ---------------------------------------------------------------------
    const searchTexts = {
        auditlogs : {
            keySearchPlaceholder : t('logs.query_condition'),
        },
        auditlogsRetired : {
            keySearchPlaceholder : t('logs.query_condition'),
        },
        adminActionLogs : {
            keySearchPlaceholder : t('adminActionLog.query_placehold'),
        },
    };
    
    const groupColumns : { auditlogs: IColumnData[], auditlogsRetired:IColumnData[], adminActionLogs: IColumnData[]} = {
        auditlogs: [
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
            { name: 'privacy_text', title: t('logs.privacy_text'), align: 'center',  type:'longText' },
            { name: 'security_text', title: t('logs.security_text'), align: 'center',  type:'longText' },
        ],
        auditlogsRetired: [
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
            { name: 'privacy_text', title: t('logs.privacy_text'), align: 'center', type:'longText' },
            { name: 'security_text', title: t('logs.security_text'), align: 'center',  type:'longText' },
        ],        
        adminActionLogs: [
            { name: 'log_date', type: 'date_simple', title: t('adminActionLog.creation_date'), align: 'center' },
            { name: 'created_by', title: t('adminActionLog.created_by'), align: 'center' },
            { name: 'application_page', title: t('adminActionLog.path'), align: 'center' },
            { name: 'application_parameter', title: t('adminActionLog.parameter'), align: 'center' },
            { name: 'application_action', title: t('adminActionLog.action'), align: 'center' },
            { name: 'ip_address', title: t('adminActionLog.ip_address'), align: 'center' },
        ],
    }

    return (
        <div className='w-full flex-col justify-start'>
            <LogClient userName={userName} groupId='' query={query}   applicationPage={`로그/${t(`logs.${category}`)}`} applicationAction='조회'/>
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
                    <AuditLogQuery
                      dateFrom = { t('logs.dateFrom')}
                      dateTo =  { t('logs.dateTo')}
                    />
                    <Search placeholder={searchTexts[category as keyof typeof searchTexts].keySearchPlaceholder} />
                </div>
                <Suspense fallback={<TableSkeleton />}>
                {( category === 'auditlogs' || category === 'auditlogsRetired' ) ?
                    <LogTable
                        columns={groupColumns[category]}
                        rows={logData}
                        currentPage={currentPage}
                        totalPages={logPages}
                        locale={locale}
                        path={category}
                        editable={false}
                    />
                    :
                    <Table
                        columns={groupColumns[category as keyof typeof groupColumns]}
                        rows={logData}
                        totalPages={logPages}
                        locale={locale}
                        path={category}
                        deleteAction={category === 'adminActionLogs' ? adapter.deleteRegularExp : undefined}
                        editable={false}
                        deletable={false}
                    />
                }
                </Suspense>
            </div>
        </div>
    );
}