'use server';

import StatQuery from "@/app/components/analysis/stat-query";
import Card from "@/app/components/dashboard/card";
import PieChart from '@/app/components/pieChart';
import VerticalBarChart from '@/app/components/verticalBarChart';
import { formatTimeYYYYpMMpDD, formatTimeYYYY_MM_DDbHHcMM_FromDB, formatTimeYYYYpMMpDD_FromDB } from '@/app/lib/utils';

const bgColors = [
  "rgba(255, 99, 132, 0.5)",
  "rgba(54, 162, 235, 0.5)",
  "rgba(255, 206, 86, 0.5)",
  "rgba(75, 192, 192, 0.5)",
  "rgba(153, 102, 255, 0.5)",
  "rgba(255, 159, 64, 0.5)",
];

export type IPrivacyData = {
    user_id: string;
    user_name: string;
    send_time: number;
    dept_name: string;
    detect_privacy: string;
}

export type IPrintData = {
    user_id: string;
    user_name: string;
    send_time: number;
    dept_name: string;
    total_pages: number;
    color_total_pages: number;
}

export type ISecurityData = {
    user_id: string;
    user_name: string;
    send_time: number;
    dept_name: string;
    detect_security: string;
}

export default async function DetectInfoWrapper({
    category, titles, trans, period, dept, periodStart, periodEnd, data, deptInfo
}: {
    category: string;
    titles: {
        main: string;
        card: string[];
        pieChart: string;
        barChart: string;
    };
    trans: (key: string) => string;
    period: "today" | "week" | "month" | "specified";
    dept?: string;
    user?: string;
    periodStart?: string;
    periodEnd?: string;
    data: IPrivacyData[] | IPrintData[] | ISecurityData[];
    deptInfo: {dept_id:string, dept_name:string}[];
}) {

    // console.log('DetectInfoWrapper', data);

    let lastTime = "-";

    interface IDetectData {
        total: number;
        detected: number;
    }

    const detectDataOfDept: Record<string, IDetectData> = {};

    for(const dept of deptInfo) {
        detectDataOfDept[dept.dept_name] = {total: 0, detected:0};
    };

    if(data.length > 0) {
        for(const item of data) {
            if(!!item.dept_name && item.dept_name !== "") {
                if(category === "print") {
                    detectDataOfDept[item.dept_name].total += (item as IPrintData).total_pages;
                    if((item as IPrintData).color_total_pages > 0) {
                        detectDataOfDept[item.dept_name].detected += (item as IPrintData).color_total_pages;
                        lastTime = formatTimeYYYY_MM_DDbHHcMM_FromDB(item.send_time);
                    }
                } else if(category === 'privacy') {
                    detectDataOfDept[item.dept_name].total += 1;
                    if(!!(item as IPrivacyData).detect_privacy) {
                        detectDataOfDept[item.dept_name].detected += 1;
                        lastTime = formatTimeYYYY_MM_DDbHHcMM_FromDB(item.send_time);
                    }
                } else {
                    detectDataOfDept[item.dept_name].total += 1;
                    if(!!(item as ISecurityData).detect_security) {
                        detectDataOfDept[item.dept_name].detected += 1;
                        lastTime = formatTimeYYYY_MM_DDbHHcMM_FromDB(item.send_time);
                    }
                };
            };
        }
    };
    
    let detectRate = "-";
    let totalCount = 0;
    let totalDetected = 0;

    for(const val of Object.values(detectDataOfDept)) {
        totalCount += val.total;
        totalDetected += val.detected;
    }

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
    // console.log('detect Data Of Dept : ',detectDataOfDept);
    const detectRateOfDept = [];

    for(const dept of deptInfo) {
        const tempData = {
            dept_name: dept.dept_name, 
            detect_rate: detectDataOfDept[dept.dept_name].detected > 0 
                ? Math.round(detectDataOfDept[dept.dept_name].detected * 10000 / detectDataOfDept[dept.dept_name].total)*0.01
                : 0
        };
        detectRateOfDept.push(tempData);
    };
    detectRateOfDept.sort((a, b) => b.detect_rate - a.detect_rate);
    const pieLabels = detectRateOfDept.map(data => data.dept_name).slice(0, 10);
    const pieData = detectRateOfDept.map(data => data.detect_rate).slice(0, 10);
    // console.log('detect Rate Of Dept : ',detectRateOfDept);

    // Data for Vertical Bar Chart Component ---------------------------------------------------------
    const detectDataOfDate: Record<string, number> = {};

    if(period === "today") {
        detectDataOfDate[formatTimeYYYYpMMpDD(new Date())] = totalDetected;
    } else {
        for(const item of data) {
            const inputData = category === "print" 
                ? (item as IPrintData).color_total_pages
                : (category === 'privacy' 
                    ? ((item as IPrivacyData).detect_privacy ? 1 : 0)
                    : ((item as ISecurityData).detect_security ? 1 : 0));
            const tempDate = formatTimeYYYYpMMpDD_FromDB(item.send_time);
            if(!detectDataOfDate[tempDate]) {
                detectDataOfDate[tempDate] = 0;
            }
            detectDataOfDate[tempDate] += inputData;
        };
    };

    const barDataSets:{ label: string; data: number[]; backgroundColor: string; }[] = [];
    const barLabels: string[] = Object.keys(detectDataOfDate);
    const tempDataSet = {
        label: '',
        data: Object.values(detectDataOfDate),
        backgroundColor: bgColors[0],
    };
    barDataSets.push(tempDataSet);

    // console.log('bar data : ',barDataSets);

    return (
        <div className='w-full pt-6'>
            <div className='w-full flex justify-between items-center mb-8 flex-col md:flex-row'>
                <h1 className="mb-4 text-xl md:text-2xl">{titles.main}</h1>
                <StatQuery
                    translated={translated}
                    departments={deptOptions}
                    period={period}
                    periodStart={periodStart}
                    periodEnd={periodEnd}
                    dept={dept}
                />
            </div>
            <div className='w-full flex justify-between gap-4 mb-4 flex-col md:flex-row'>
                <Card title={titles.card[0]} value={totalCount + "건"} />
                <Card title={titles.card[1]} value={totalDetected + "건"} />
                <Card title={titles.card[2]} value={detectRate} />
                <Card title={titles.card[3]} value={lastTime} />
            </div>
            <div className='w-full flex gap-4 mb-4 flex-col md:flex-row'>
                <div className='flex-1 p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">{titles.pieChart}</h3>
                    <div className="max-h-96">
                        <PieChart
                            labels={pieLabels}
                            dataSet={[{
                                label: titles.pieChart,
                                data: pieData,
                            }]}
                        />
                    </div>
                </div>
                <div className='flex-1 p-4 border border-gray-300 rounded-lg'>
                    <h3 className="mb-4 text-md font-normal">{titles.barChart}</h3>
                    <div className="max-h-96">
                        <VerticalBarChart
                            xlabels={barLabels}
                            dataSets={ barDataSets }
                            stack = {false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
