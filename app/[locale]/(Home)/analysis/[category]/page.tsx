import { Suspense } from "react";
import type { Metadata } from "next";
import Link from 'next/link';
import clsx from 'clsx';
import { notFound } from 'next/navigation';
import MyDBAdapter from '@/app/lib/adapter';
import getDictionary from '@/app/locales/dictionaries';
import { TableSkeleton } from "@/app/components/skeletons";
import InfoQuery from "@/app/components/analysis/info-query";
import TableView from "@/app/components/analysis/table-view";

import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import
import { auth } from "@/auth";
import LogClient from '@/app/lib/logClient';
import { IColumnData } from "@/app/lib/definitions";
import { formatTimeYYYYpMMpDD } from "@/app/lib/utils";
import { initialize } from "next/dist/server/lib/render-server";


export const metadata: Metadata = {
    title: 'Analysis',
}

interface IAnalysisParams {
    itemsPerPage?: string,
    page?: string,
    periodStart?: string,
    periodEnd?: string,
    dept?: string,
    user?: string,
    device?: string,
    // jobType?: string,
}

export default async function Page(props: {
    searchParams?: Promise<IAnalysisParams>;
    params: Promise<{ locale: "ko" | "en", category: string }>;
}) {
    const { locale, category } = await props.params;
    const searchParams = await props.searchParams;
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;

    const currentTime = new Date();
    const periodEndParam = searchParams?.periodEnd || formatTimeYYYYpMMpDD(currentTime);
    currentTime.setDate(1);
    const periodStartParam = searchParams?.periodStart || formatTimeYYYYpMMpDD(currentTime);
    const deptParam = searchParams?.dept;
    const userParam = searchParams?.user;
    const deviceParam = searchParams?.device;
    // const jobTypeParam = searchParams?.jobType;
    const session = await auth();

    const userName = session?.user.name ?? "";
    if(!userName) redirect('/login'); // '/login'으로 리다이렉트
    if( session?.user.role !== 'admin') return notFound();

    if (!['print', 'privacy'].includes(category)) {
        notFound();
    };

    const adapter = MyDBAdapter();
    const [trans, data, allDepts, allDevices] = await Promise.all([
        getDictionary(locale),
        category === "print" 
            ? adapter.getPrintInfoByQuerygetPrivacyDetectInfoByUsers(periodStartParam, periodEndParam, deptParam, userParam, deviceParam)
            : adapter.getPrivacyInfoByQuerygetPrivacyDetectInfoByUsers(periodStartParam, periodEndParam, deptParam, userParam),
        adapter.getAllDepts(),
        adapter.getAllDevices(),
    ]);

    // Manipulate data
    // console.log("Analysis (raw) : ", data);
    const dataForCards = {};
    const dataForTable = {};
    if(category === 'print') {
        dataForCards["total_pages"] = 0;
        dataForCards["dept_count"] = 0;
        dataForCards["user_count"] = 0;
        dataForCards["device_count"] = 0;

        dataForTable["dept"] = [];
        dataForTable["user"] = [];
        dataForTable["device"] = [];
        
        for(const item of data) {
            dataForCards.total_pages += item.total_pages;

            const deptIdx = dataForTable.dept.findIndex(dept => dept.dept_name === item.dept_name );
            if(deptIdx === -1){
                dataForCards.dept_count += 1;

                const initData = {dept_name: item.dept_name, Copy: 0, Scan: 0, Print: 0, Fax: 0};
                initData[item.job_type] = item.total_pages;
                dataForTable.dept.push(initData);
            } else {
                dataForTable.dept[deptIdx][item.job_type] += item.total_pages;
            };

            const userIdx = dataForTable.user.findIndex(user => user.user_name === item.user_name );
            if(userIdx === -1){
                dataForCards.user_count += 1;
                const initData = {user_name: item.user_name, Copy: 0, Scan: 0, Print: 0, Fax: 0};
                initData[item.job_type] = item.total_pages;
                dataForTable.user.push(initData);
            } else {
                dataForTable.user[userIdx][item.job_type] += item.total_pages;
            };

            const deviceIdx = dataForTable.device.findIndex(device => device.device_id === item.device_id );
            if(deviceIdx === -1){
                dataForCards.device_count += 1;
                const initData = {device_id: item.device_id, device_name: item.device_name, Copy: 0, Scan: 0, Print: 0, Fax: 0};
                initData[item.job_type] = item.total_pages;
                dataForTable.device.push(initData);
            } else {
                dataForTable.device[deviceIdx][item.job_type] += item.total_pages;
            };
        };
    } else if(category === 'privacy') {
        dataForTable["privacy"] = [ ...data ];
    }
    // console.log('Data For Table :', dataForTable);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'print', title: trans('analysis.analize_print'), link: `/analysis/print` },
        { category: 'privacy', title: trans('analysis.analize_privacy'), link: `/analysis/privacy` },
    ];
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
        device: trans('analysis.category_device'),
        dept: trans('analysis.category_dept'),
        user: trans('analysis.category_user'),
        initialize: trans('common.initialize'),
    };

    const queryKeys = {
        print: ["periodStart","periodEnd","dept","user","device"],  //,"jobType"],
        privacy: ["periodStart","periodEnd","dept"],
    };

    const dataForQuery = {
        print: {
            periodStart: periodStartParam,
            periodEnd: periodEndParam,
            dept: deptParam,
            user: userParam,
            device: deviceParam,
            // jobType: jobTypeParam
        },
        privacy: {
            periodStart: periodStartParam,
            periodEnd: periodEndParam,
            dept: deptParam,
            user: userParam,
        }
    }

    const optionsForQuery = {
        dept: [{title: trans('user.select_dept'), value: ""},
            ...allDepts.map(item => ({title: item.dept_name, value: item.dept_name}))],
        device: [{title: trans('device.select_device'), value: ""},
            ...allDevices.map(item => ({title: item.device_name, value: item.device_id}))],
        jobType: [{title: trans('analysis.select_jobtype'), value: ""},
            {title: trans('common.copy'), value: "COPY"},
            {title: trans('common.fax'), value: "FAX"},
            {title: trans('common.scan'), value: "SCAN"},
            {title: trans('common.print'), value: "PRINT"},
        ],
    };

    const cardData = [
        { title: trans('analysis.print_total_pages'), value: dataForCards.total_pages },
        { title: trans('analysis.print_depts'), value: dataForCards.dept_count },
        { title: trans('analysis.print_device'), value: dataForCards.device_count },
        { title: trans('analysis.print_users'), value: dataForCards.user_count },
    ];

    const columnSubs: IColumnData[] = [
        { name: 'Print', title: trans('common.print'), align: 'center' },
        { name: 'Copy', title: trans('common.copy'), align: 'center' },
        { name: 'Scan', title: trans('common.scan'), align: 'center' },
        { name: 'Fax', title: trans('common.fax'), align: 'center' },
    ];
    
    const columns: { 
        print : { dept: IColumnData[], user: IColumnData[], device: IColumnData[]},
        privacy: { privacy: IColumnData[]},

    } = {
        print : {
            dept: [
                { name: 'dept_name', title: trans('user.department'), align: 'center' },
                ...columnSubs
            ],
            user: [
                { name: 'user_name', title: trans('user.user_name'), align: 'center' },
                ...columnSubs
            ],
            device: [
                { name: 'device_name', title: trans('device.device'), align: 'center' },
                ...columnSubs
            ],
        },
        privacy: { privacy : [
                { name: 'send_time', title: trans('analysis.detect_time'), align: 'center' },
                { name: 'user_name', title: trans('user.user_id'), align: 'center' },
                { name: 'external_user_name', title: trans('user.user_name'), align: 'center' },
                { name: 'document_name', title: trans('printer.document_name'), align: 'center' },
                { name: 'detected_items', title: trans('analysis.detect_items'), align: 'center' },
                { name: 'status', title: trans('analysis.action_status'), align: 'center' },
                { name: 'action', title: trans('analysis.action'), align: 'center' },
            ]
        },
    };

    const tableTitle = category === "print" ? null : trans('analysis.detect_item_list');
    const defaultSec = category === "print" ? "dept" : "privacy";

    return (
        <div className='w-full flex-col justify-start'>
            <LogClient userName={userName} groupId='' query=""   applicationPage='로그' applicationAction='조회'/>
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
                <div className="py-4 flex items-center justify-between gap-2 md:py-8">
                    <InfoQuery
                        translated={translated}
                        queryKeys={queryKeys[category]}
                        queryData={dataForQuery[category]}
                        options={optionsForQuery}
                    />
                </div>
                {category === 'print' &&
                    <div className="mb-8 flex flex-col items-stretch text-sm md:flex-row md:gap-4">
                        {cardData.map((item, idx) => 
                            <div key={idx} className="flex-1 h-12 border border-gray-300 rounded-lg flex items-center justify-between px-4 bg-white">
                                <div className=""> {item.title} :</div>
                                <div className="font-semibold"> {item.value}</div>
                            </div>
                        )}
                    </div>
                }
                <div className="mb-4 p-2">
                    <Suspense fallback={<TableSkeleton />}>
                        <TableView
                            defaultSection={defaultSec}
                            columns={columns[category]}
                            rows={dataForTable}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            translated={translated}
                            title={tableTitle}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}