import type { Metadata } from "next";
import { Suspense } from "react";
import Link from 'next/link';
import clsx from 'clsx';
import { notFound } from 'next/navigation';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import DetectInfoWrapper from "@/app/components/analysis/detect-info";
import Table from '@/app/components/dashboard/table';
import { TableSkeleton } from "@/app/components/skeletons";
import { IColumnData } from '@/app/lib/definitions';

import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import
import { auth } from "@/auth";
import LogClient from '@/app/lib/logClient';


export const metadata: Metadata = {
    title: 'Analysis',
}

interface IAnalysisParams {
    period?: "today" | "week" | "month" | "specified",
    dept?:string,
    user?:string,
    periodStart?:string,
    periodEnd?:string,
}

export type IPrivacyInfoValue = {
    user_name: string;
    external_user_name: string;
    dept_name: string;
    total_count: string;
    detect_privacy_count: string;
    percent_detect: string;
}


export default async function Page(props: {
    searchParams?: Promise<IAnalysisParams>;
    params: Promise<{ locale: "ko" | "en", category: string }>;
}) {
    const { locale, category } = await props.params;
    const searchParams = await props.searchParams;
    const periodParam = searchParams?.period?? "month";
    const deptParam = searchParams?.dept;
    const userParam = searchParams?.user;
    const periodStartParam = searchParams?.periodStart;
    const periodEndParam = searchParams?.periodEnd;

    const session = await auth();

    const userName = session?.user.name ?? "";
    if(!userName) redirect('/login'); // '/login'으로 리다이렉트
    if( session?.user.role !== 'admin') return notFound();

    if (!['print', 'privacy', 'security'].includes(category)) {
        notFound();
    };

    const adapter = MyDBAdapter();
    const [t, detectedData, detectedByUser, allDepts] = await Promise.all([
        getDictionary(locale),
        category === 'privacy' ? adapter.getPrivacytDetectedData(periodParam, periodStartParam, periodEndParam, deptParam, userParam)
            : (category === 'print' ? adapter.getPrivacytDetectedData(periodParam, periodStartParam, periodEndParam, deptParam, userParam)
                : adapter.getPrivacytDetectedData(periodParam, periodStartParam, periodEndParam, deptParam, userParam)),
        category === 'privacy' ? adapter.getPrivacyDetectInfoByUsers(periodParam, periodStartParam, periodEndParam, deptParam, userParam)
            : (category === 'print' ? adapter.getPrivacyDetectInfoByUsers(periodParam, periodStartParam, periodEndParam, deptParam, userParam)
                : adapter.getPrivacyDetectInfoByUsers(periodParam, periodStartParam, periodEndParam, deptParam, userParam)),
        adapter.getAllDepts(),
    ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'print', title: t('analysis.analize_print'), link: `/analysis/print` },
        { category: 'privacy', title: t('analysis.analize_privacy'), link: `/analysis/privacy` },
        { category: 'security', title: t('analysis.analize_security'), link: `/analysis/security` },
    ];

    // Data for Table Component -----------------------------------------------------------------
    const detectedUserList = detectedByUser.map((data: IPrivacyInfoValue, idx:number) => ({
        ...data,
        rank : idx+1,
        details: '/logs/auditLogs'
    }));

    const columns: IColumnData[] = [
        { name: 'rank', title: t('common.rank'), align: 'center' },
        { name: 'user_name', title: t('user.user_name'), align: 'center' },
        { name: 'external_user_name', title: t('common.name'), align: 'center' },
        { name: 'dept_name', title: t('user.department'), align: 'center' },
        { name: 'total_count', title: t('print.print_count'), align: 'center' },
        { name: 'detect_privacy_count', title: t('settings.detect_count'), align: 'center' },
        { name: 'percent_detect', title: t('settings.detect_rate'), align: 'center' },
        // { name: 'details', title: trans('user.subTitle_detail'), align: 'center', type:'link' },
    ];

    return (
        <div className='w-full flex-col justify-start'>
            <LogClient userName={userName} groupId='' query=""   applicationPage='anaysis' applicationAction='조회'/>
            <div className="pl-2">
                {subTitles.map(item => {
                    return <Link key={item.category} href={item.link}
                        className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                            { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === category },
                            { "text-gray-300  bg-white border-2": item.category !== category },
                        )}>{item.title}</Link>;
                })}
            </div>
            <div className="w-full p-4 bg-gray-50 rounded-md">
                <DetectInfoWrapper
                    trans={t}
                    period={periodParam}
                    dept={deptParam}
                    periodStart={periodStartParam}
                    periodEnd={periodEndParam}
                    data={detectedData}
                    deptInfo={allDepts}
                />
                <div className='w-full gap-4'>
                    <div className='flex-col p-4 border border-gray-300 rounded-lg bg-white'>
                        <h3 className="mb-4 text-md font-normal">{t('dashboard.privacy_info_detect_stats')}</h3>
                        <Suspense fallback={<TableSkeleton />}>
                            <Table
                                columns={columns}
                                rows={detectedUserList}
                                locale={locale}
                            />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
