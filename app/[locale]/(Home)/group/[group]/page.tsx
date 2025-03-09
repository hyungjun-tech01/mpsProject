import type { Metadata } from "next";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';
import {
    fetchGroupsBy,
    fetchGroupPagesBy
} from '@/app/lib/fetchGroupData';
import {
    deleteGroup
} from '@/app/lib/actionsGroup';


export const metadata: Metadata = {
    title: 'Group',
}

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ group: 'device' | 'user' | 'security', locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const group = params.group;
    const locale = params.locale;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };

    const [t, totalPages, groupData] = await Promise.all([
        getDictionary(locale),
        fetchGroupPagesBy(query, group, itemsPerPage),
        fetchGroupsBy(query, group, itemsPerPage, currentPage, locale),
    ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'device', title: t('group.subTitle_device'), link: `/group/device` },
        { category: 'user', title: t('group.subTitle_user'), link: `/group/user` },
        { category: 'security', title: t('group.subTitle_security'), link: `/group/security` },
    ];

    // Search Text ---------------------------------------------------------------------
    const groupTexts = {
        device : {
            keySearchPlaceholder : t('group.search_placehodler_device'),
        },
        user : {
            keySearchPlaceholder : t('group.search_placehodler_user'),
        },
        security : {
            keySearchPlaceholder : t('group.search_placehodler_security'),
        }
    };

    // Columns -------------------------------------------------------------------
    const groupColumns : { device: IColumnData[], user: IColumnData[], security: IColumnData[]} = {
        device: [
            { name: 'group_name', title: t('group.group_name'), align: 'center' },
            { name: 'device_count', title: t('group.device_count'), align: 'center' },
            { name: 'created_date', title: t('common.created'), align: 'center', type: 'date' },
        ],
        user: [
            { name: 'group_name', title: t('group.group_name'), align: 'left' },
            { name: 'created_date', title: t('common.created'), align: 'left', type: 'date' },
            { name: 'remain_amount', title: t('account.balance'), align: 'center', type: 'currency' },
            { name: 'schedule_amount', title: t('group.allocate_amount'), align: 'center', type: 'currency' },
            { name: 'schedule_period', title: t('group.allocate_period'), align: 'center' },
        ],
        security: [
            { name: 'group_name', title: t('group.group_name'), align: 'center' },
            { name: 'created_date', title: t('common.created'), align: 'center', type: 'date' },
            { name: 'group_notes', title: t('common.explanation'), align: 'center' },
            { name: 'dept_count', title: t('security.dept_count'), align: 'center' },
            { name: 'manager_count', title: t('security.manager_count'), align: 'center' },
        ]
    };

    return (
        <div className='w-full flex-col justify-start'>
            <div className="pl-2">
            {subTitles.map(item => {
                return <Link key={item.category} href={item.link}
                    className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                        { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === group },
                        { "text-gray-300  bg-white border-2": item.category !== group },
                    )}>{item.title}</Link>;
            })}
            </div>
            <div className="w-full px-4 bg-gray-50 rounded-md">
                <div className="pt-4 flex items-center justify-between gap-2 md:pt-8">
                    <Search placeholder={groupTexts[group].keySearchPlaceholder} />
                    <CreateButton link={`/group/${group}/create`} title={t('group.create_group')} />
                </div>
                <Table
                    columns={groupColumns[group]}
                    rows={groupData}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    path={`/group/${group}`}
                    locale={locale}
                    deleteAction={deleteGroup}
                />
            </div>
        </div>
    );
}