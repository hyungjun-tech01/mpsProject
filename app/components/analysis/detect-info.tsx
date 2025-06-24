'use server';

import StatQuery from "@/app/components/analysis/stat-query";
import Card from "@/app/components/dashboard/card";
import PieChart from '@/app/components/pieChart';
import VerticalBarChart from '@/app/components/verticalBarChart';
import { formatTimeYYYYpMMpDD, formatTimeYYYY_MM_DDbHHcMM_FromDB, formatTimeYYYYpMMpDD_FromDB } from '@/app/lib/utils';


export type IPrivacyData = {
    user_id: string;
    user_name: string;
    send_time: number;
    dept_name: string;
    detect_privacy: string;
}

export default async function DetectInfoWrapper({
    trans, period, dept, periodStart, periodEnd, data, deptInfo
}: {
    trans: (key: string) => string;
    period: "today" | "week" | "month" | "specified";
    dept?: string;
    user?: string;
    periodStart?: string;
    periodEnd?: string;
    data: IPrivacyData[];
    deptInfo: {dept_id:string, dept_name:string}[];
}) {

    const totalCount = data.length;
    let totalDetected = 0;
    let lastTime = "-";

    interface IDetectData {
        total: number;
        detected: number;
    }

    const detectDataOfDept: Record<string, IDetectData> = {};
    const detectRateOfDept: Record<string, number> = {};

    for(const dept of deptInfo) {
        detectDataOfDept[dept.dept_name] = {total: 0, detected:0};
        detectRateOfDept[dept.dept_name] = 0;
    };

    if(totalCount > 0) {
        let isFirstFound = false;
        for(const item of data) {
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
    
    let detectRate = "-";
    if(totalCount > 0) {
        if(totalDetected === 0) {
            detectRate = "0 %";
        } else {
            const temp =  String(Math.round(totalDetected * 1000 /totalCount));
            detectRate = temp.slice(0,-1) + "." + temp.slice(-1,) + " %";
        }
    }

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
        ...deptInfo.map((item:{dept_id:string, dept_name:string}) => ({title: item.dept_name, value: item.dept_id})),
        {title: trans('common.all'), value: "all"}
    ];

    // Data for Pie Bar Chart Component ---------------------------------------------------------
    for(const dept of deptInfo) {
        detectRateOfDept[dept.dept_name] = detectDataOfDept[dept.dept_name].detected > 0 
            ? Math.round(detectDataOfDept[dept.dept_name].detected * 10000 / detectDataOfDept[dept.dept_name].total)*0.01
            : 0;
    };

    // Data for Vertical Bar Chart Component ---------------------------------------------------------
    const detectDataOfDate: Record<string, number> = {};
    if(period === "today") {
        detectDataOfDate[formatTimeYYYYpMMpDD(new Date())] = totalCount;
    } else {
        const tempData: Record<string, number> = {};
        for(const item of data) {
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

    return (
        <div className='w-full pt-6'>
            <div className='w-full flex justify-between items-center mb-8`'>
                <h1 className="mb-4 text-xl md:text-2xl">{trans('dashboard.privacy_info_detect_stats')}</h1>
                <StatQuery
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
                    <div className="max-h-96">
                        <PieChart
                            labels={Object.keys(detectRateOfDept).slice(0, 10)}
                            dataSet={[{
                                label: trans('dashboard.privacy_detect_by_dept'),
                                data: Object.values(detectRateOfDept).slice(0, 10),
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
        </div>
    );
}
