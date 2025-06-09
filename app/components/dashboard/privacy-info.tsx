'use server';

import { Suspense } from "react";
import { IColumnData } from '@/app/lib/definitions';
import PrivacyQuery from "./privacy-query";
import Card from "./card";
import PieChart from '../pieChart';
import VerticalBarChart from '../verticalBarChart';
import Table from '@/app/components/dashboard/table';
import { TableSkeleton } from "@/app/components/skeletons";
import MyDBAdapter from '@/app/lib/adapter';


export default async function PrivacyInfoWrapper({
    trans, locale, period, dept, user, periodStart, periodEnd
}: {
    trans: (key: string) => string;
    locale: "ko" | "en";
    period: string;
    dept?: string;
    user?: string;
    periodStart?: string;
    periodEnd?: string;
}) {
    const adapter = MyDBAdapter();
    const [totalPages, detectedByUser] = await Promise.all([
        adapter.getAllTotalPageSum(period, periodStart, periodEnd, dept, user),
        adapter.getPrivacyDetectInfoByUsers(period, periodStart, periodEnd, dept, user),
    ]);

    const detectedUserList = detectedByUser.map((data, idx) => ({
        ...data,
        rank : idx+1,
        details: '/logs/auditLogs'
    }));

    const columns: IColumnData[] = [
        { name: 'rank', title: trans('common.rank'), align: 'center' },
        { name: 'user_name', title: trans('user.user_name'), align: 'center' },
        { name: 'full_name', title: trans('common.name'), align: 'center' },
        { name: 'department', title: trans('user.department'), align: 'center' },
        { name: 'total_count', title: trans('print.print_count'), align: 'center' },
        { name: 'detect_privacy_count', title: trans('settings.detect_count'), align: 'center' },
        { name: 'percent_detect', title: trans('settings.detect_rate'), align: 'center' },
        { name: 'details', title: trans('user.subTitle_detail'), align: 'center', type:'link' },
    ];

    // const data = [
    //     {rank: 1, user_name: 'test_1', full_name: '테스트1', department: 'IT팀', print_count: 421, detect_count: 18, detect_rate: '4.3%', link: '/logs/auditLogs'},
    //     {rank: 2, user_name: 'test_2', full_name: '테스트2', department: 'IT팀', print_count: 517, detect_count: 15, detect_rate: '2.9%', link: '/logs/auditLogs'},
    //     {rank: 3, user_name: 'test_3', full_name: '테스트3', department: 'IT팀', print_count: 393, detect_count: 13, detect_rate: '3.7%', link: '/logs/auditLogs'},
    //     {rank: 4, user_name: 'test_4', full_name: '테스트4', department: 'IT팀', print_count: 286, detect_count: 11, detect_rate: '2.8%', link: '/logs/auditLogs'},
    //     {rank: 5, user_name: 'test_5', full_name: '테스트5', department: 'IT팀', print_count: 156, detect_count: 5, detect_rate: '3.3%', link: '/logs/auditLogs'},
    // ]
    
    return (
        <div className='w-full border-t border-gray-300 pt-4'>
            <div className='w-full flex justify-between items-center mb-4`'>
                <h1 className="mb-4 text-xl md:text-2xl">{trans('dashboard.privacy_info_detect_stats')}</h1>
                <PrivacyQuery trans={trans} period={period} dept={dept} user={user} />
            </div>
            <div className='w-full flex justify-between gap-4 mb-4'>
                <Card title="총 출력 건수" value={totalPages + "건"} />
                <Card title="개인정보 포함 건수" value={289 + "건"} />
                <Card title="검출률" value="2.25%" />
                <Card title="최종 검출 일시" value="2025-05-23 16:45" />
            </div>
            <div className='w-full flex gap-4 mb-4'>
                <div className='flex-1 p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">개인정보 종류별 검출 비율</h3>
                    <div className="h-64">
                        <PieChart />
                    </div>
                </div>
                <div className='flex-1 p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">개인정보 시간별 검출 추이</h3>
                    <div className="h-64">
                        <VerticalBarChart />
                    </div>
                </div>
            </div>
            <div className='w-full gap-4 mb-4'>
                <div className='flex-col p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">사용자별 개인정보 출력 통계</h3>
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
    );
}