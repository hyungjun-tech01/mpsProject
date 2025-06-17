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
import { formatTimeYYYYpMMpDD, formatTimeYYYY_MM_DDbHHcMM_FromDB, formatTimeYYYYpMMpDD_FromDB } from '@/app/lib/utils';


export default async function PrivacyInfoWrapper({
    trans, locale, period, dept, user, periodStart, periodEnd
}: {
    trans: (key: string) => string;
    locale: "ko" | "en";
    period: "today" | "week" | "month" | "specified";
    dept?: string;
    user?: string;
    periodStart?: string;
    periodEnd?: string;
}) {
    const adapter = MyDBAdapter();
    const [ detectedData, detectedByUser, allDepts] = await Promise.all([
        adapter.getPrivacytDetectedData(period, periodStart, periodEnd, dept, user),
        adapter.getPrivacyDetectInfoByUsers(period, periodStart, periodEnd, dept, user),
        adapter.getAllDepts(),
    ]);

    const totalCount = detectedData.length;
    let totalDetected = 0;
    let lastTime = "-";

    const detectDataOfDept = {};
    const detectRateOfDept = {};

    for(const dept of allDepts) {
        detectDataOfDept[dept.dept_name] = {total: 0, detected:0};
        detectRateOfDept[dept.dept_name] = 0;
    };

    if(totalCount > 0) {
        let isFirstFound = false;
        for(const item of detectedData) {
            if(!!item.dept_name && item.dept_name !== "") {
                detectDataOfDept[item.dept_name].total += 1;
            }
            if(item.detect_privacy) {
                totalDetected += 1;
                if(!isFirstFound) {
                    lastTime = formatTimeYYYY_MM_DDbHHcMM_FromDB(item.send_time);
                    isFirstFound = true;
                }
                if(!!item.dept_name && item.dept_name !== "") {
                    detectDataOfDept[item.dept_name].detected += 1;
                }
            }
        }
    };
    
    const detectRate = totalCount > 0
        ? (!!totalDetected ? String(Math.round(totalDetected * 1000 /totalCount)*0.1) + " %" : "0 %" ) : "-";

    // Data for Privacy Query Component ---------------------------------------------------------
    const translated = {
        period: trans('common.period'),
        today: trans('common.today'),
        week: trans('common.week'),
        month: trans('common.month'),
        specified: trans('common.specified_period'),
        department: trans('user.department'),
        user_name_or_id: trans('dashboard.user_name_or_id'),
        dept_all: trans('common.all'),
        from: trans('dashboard.from'),
        to: trans('dashboard.to'),
    }

    const deptOptions = [
        ...allDepts.map(item => ({title: item.dept_name, value: item.dept_id})),
        {title: trans('common.all'), value: "all"}
    ];

    // Data for Pie Bar Chart Component ---------------------------------------------------------
    for(const dept of allDepts) {
        detectRateOfDept[dept.dept_name] = detectDataOfDept[dept.dept_name].detected > 0 
            ? Math.round(detectDataOfDept[dept.dept_name].detected * 10000 / detectDataOfDept[dept.dept_name].total)*0.01
            : 0;
    };

    // Data for Vertical Bar Chart Component ---------------------------------------------------------
    const detectDataOfDate = {};
    if(period === "today") {
        detectDataOfDate[formatTimeYYYYpMMpDD(new Date())] = totalCount;
    } else {
        const tempData = {};
        for(const item of detectedData) {
            const tempDate = formatTimeYYYYpMMpDD_FromDB(item.send_time);
            if(!!tempData[tempDate]) {
                tempData[tempDate] += 1;
            } else {
                tempData[tempDate] = 1;
            }
        }
        for(const key of Object.keys(tempData).sort()) {
            detectDataOfDate[key] = tempData[key];
        }
    }

    // Data for Table Component -----------------------------------------------------------------
    const detectedUserList = detectedByUser.map((data, idx) => ({
        ...data,
        rank : idx+1,
        details: '/logs/auditLogs'
    }));

    const columns: IColumnData[] = [
        { name: 'rank', title: trans('common.rank'), align: 'center' },
        { name: 'user_name', title: trans('user.user_name'), align: 'center' },
        { name: 'external_user_name', title: trans('common.name'), align: 'center' },
        { name: 'dept_name', title: trans('user.department'), align: 'center' },
        { name: 'total_count', title: trans('print.print_count'), align: 'center' },
        { name: 'detect_privacy_count', title: trans('settings.detect_count'), align: 'center' },
        { name: 'percent_detect', title: trans('settings.detect_rate'), align: 'center' },
        // { name: 'details', title: trans('user.subTitle_detail'), align: 'center', type:'link' },
    ];
    
    return (
        <div className='w-full border-t border-gray-300 pt-6'>
            <div className='w-full flex justify-between items-center mb-8`'>
                <h1 className="mb-4 text-xl md:text-2xl">{trans('dashboard.privacy_info_detect_stats')}</h1>
                <PrivacyQuery
                    translated={translated}
                    departments={deptOptions}
                    period={period}
                    periodStart={periodStart}
                    periodEnd={periodEnd}
                    dept={dept}
                />
            </div>
            <div className='w-full flex justify-between gap-4 mb-4'>
                <Card title={trans('dashboard.total_print_count')} value={totalCount + "건"} />
                <Card title={trans('dashboard.privacy_detect_count')} value={totalDetected + "건"} />
                <Card title={trans('dashboard.privacy_detect_rate')} value={detectRate} />
                <Card title={trans('dashboard.privacy_last_detect_time')} value={lastTime} />
            </div>
            <div className='w-full flex gap-4 mb-4'>
                <div className='flex-1 p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">{trans('dashboard.privacy_detect_by_dept')}</h3>
                    <div className="max-h-96 flex justify-center">
                        <PieChart
                            labels={Object.keys(detectRateOfDept)}
                            dataSet={[{
                                label: trans('dashboard.privacy_detect_by_dept'),
                                data: Object.values(detectRateOfDept),
                            }]}
                        />
                    </div>
                </div>
                <div className='flex-1 p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">{trans('dashboard.privacy_detect_by_date')}</h3>
                    <div className="max-h-96">
                        <VerticalBarChart
                            title=""
                            xlabels={Object.keys(detectDataOfDate)}
                            dataSet={[{
                                label: trans('dashboard.privacy_detect_count'),
                                data: Object.values(detectDataOfDate),
                                backgroundColor: 'rgba(63, 98, 18, 0.5)',
                            }]}
                        />
                    </div>
                </div>
            </div>
            <div className='w-full gap-4 mb-4'>
                <div className='flex-col p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">{trans('dashboard.privacy_info_detect_stats')}</h3>
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