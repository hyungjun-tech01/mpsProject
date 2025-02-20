import type { Metadata } from "next";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';


export const metadata: Metadata = {
    title: 'Group',
}


export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ group: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const group = params.group;
    const locale = params.locale;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;

    const [t, ] = await Promise.all([
        getDictionary(locale),
    ]);
    const deviceGroupData = [];
    const userGroupData = [];
    const securityGroupData = [];

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'device', title: t('group.subTitle_device'), link: `/group/device` },
        { category: 'user', title: t('group.subTitle_user'), link: `/group/user` },
        { category: 'security', title: t('group.subTitle_security'), link: `/group/security` },
    ];

    // Total pages ---------------------------------------------------------------
    const totalPages = {
        device : 0,
        user : 0,
        security: 0,
    }

    // Texts ---------------------------------------------------------------------
    const totalTexts = {
        device: { search_placeholder : "Search device groups..." },
        user: { search_placeholder : "Search user groups..."}, 
        security: { search_placeholder : "Search security groups..."},
    };

    // Columns -------------------------------------------------------------------
    const totalColumns = {
        device : [
            { name: 'device_name', title: t('device.device_name'), align: 'center' },
            { name: 'ip_address', title: t('common.ip_address'), align: 'center' },
            { name: 'location', title: t('device.location'), align: 'center' },
            { name: 'model_name', title: t('device.model_name'), align: 'center' },
            { name: 'status', title: t('common.status'), align: 'center' },
        ],
        user : [
            { name: 'group_name', title: t('group.group_name'), align: 'center' },
            { name: 'created', title: t('common.created'), align: 'center' },
            { name: 'balance', title: t('account.balance'), align: 'center' },
            { name: 'allocate_amount', title: t('group.allocate_amount'), align: 'center' },
            { name: 'allocate_period', title: t('group.allocate_period'), align: 'center' },
        ],
        security : [
            { name: 'group_name', title: t('group.group_name'), align: 'center' },
            { name: 'created', title: t('common.created'), align: 'center' },
            { name: 'balance', title: t('account.balance'), align: 'center' },
            { name: 'allocate_amount', title: t('group.allocate_amount'), align: 'center' },
            { name: 'allocate_period', title: t('group.allocate_period'), align: 'center' },
        ]
    };

    // Data ---------------------------------------------------------------------
    const totalData = {
        device : deviceGroupData,
        user : userGroupData,
        security: securityGroupData
    };

    // Delete Action ------------------------------------------------------------
    const totalDeleteAction = {
        device: null,
        user : null,
        security : null,
    };

    return (
        <div className='w-full pl-2 flex-col justify-start'>
            {subTitles.map(item => {
                return <Link key={item.category} href={item.link}
                    className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                        { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === group },
                        { "text-gray-300  bg-white border-2": item.category !== group },
                    )}>{item.title}</Link>;
            })}
            <div className="w-full">
                <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                    <Search placeholder={totalTexts[group].search_placeholder} />
                    <CreateButton link={`/group/${group}/create`} title="Create Group" />
                </div>
                <Table
                    columns={totalColumns[group]}
                    rows={totalData[group]}
                    currentPage={currentPage}
                    totalPages={totalPages[group]}
                    category={group}
                    locale={locale}
                    deleteAction={totalDeleteAction[group]}
                />
            </div>
        </div>
    );
}