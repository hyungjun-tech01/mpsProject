import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/breadcrumbs';
import MemberTable from '@/app/components/table';
import { ISearch, IBreadCrums, IColumnData } from '@/app/lib/definitions';
import { createGroup, modifyGroup } from '@/app/lib/actionsGroup';
import getDictionary from '@/app/locales/dictionaries';


export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ group: string, category: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const group = params.group;
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };

    const t = await getDictionary(locale);

    const groupBreadcrumbs: { device: IBreadCrums[], user: IBreadCrums[], security: IBreadCrums[] } = {
        device: [
            { label: t('group.subTitle_device'), link: `/group/device` },
            { label: `${t('group.create_group')}`, link: `/group/device/create` }
        ],
        user: [
            { label: t('group.subTitle_user'), link: `/group/user` },
            { label: `${t('group.create_group')}`, link: `/group/user/create` }
        ],
        security: [
            { label: t('group.subTitme_security'), link: `/group/security` },
            { label: `${t('group.create_group')}`, link: `/group/security/create` }
        ]
    };
    const editItems: { device: ISection[], user: ISection[], security: ISection[] } = {
        device: [
            {
                title: t('common.details'), description: [
                    t('comment.group_edit_group_name'),
                    t('comment.group_edit_schedule'),
                ],
                items: [
                    { name: 'group_name', title: t('group.group_name'), type: 'input', defaultValue: "" },
                    { name: 'schedule_period', title: t('group.schedule_period'), type: 'select', defaultValue: "NONE",
                        options: [
                            { title: t('common.none'), value: 'NONE' },
                            { title: t('common.per_day'), value: 'PER_DAY' },
                            { title: t('common.per_week'), value: 'PER_WEEK' },
                            { title: t('common.per_month'), value: 'PER_MONTH' },
                            { title: t('common.per_year'), value: 'PER_YEAR' },
                        ]
                    },
                    { name: 'schedule_amount', title: t('group.schedule_amount'), type: 'currency', defaultValue: 0 },
                ]
            },
        ],
        user: [
            {
                title: t('common.details'), description: [
                    t('comment.group_edit_group_name'),
                    t('comment.group_edit_schedule'),
                ],
                items: [
                    { name: 'group_name', title: t('group.group_name'), type: 'label', defaultValue: "" },
                    { name: 'schedule_period', title: t('group.schedule_period'), type: 'select', defaultValue: 'NONE',
                        options: [
                            { title: t('common.none'), value: 'NONE' },
                            { title: t('common.per_day'), value: 'PER_DAY' },
                            { title: t('common.per_week'), value: 'PER_WEEK' },
                            { title: t('common.per_month'), value: 'PER_MONTH' },
                            { title: t('common.per_year'), value: 'PER_YEAR' },
                        ]
                    },
                    { name: 'schedule_amount', title: t('group.schedule_amount'), type: 'currency', defaultValue: 0 },
                ]
            },
        ],
        security: [
            {
                title: t('common.details'), description: t('comment.group_edit_device_description'),
                items: [
                    { name: 'group_name', title: t('group.group_name'), type: 'input', defaultValue: "" },
                    { name: 'schedule_period', title: t('group.schedule_period'), type: 'select', defaultValue: "NONE",
                        options: [
                            { title: t('common.none'), value: 'NONE' },
                            { title: t('common.per_day'), value: 'PER_DAY' },
                            { title: t('common.per_week'), value: 'PER_WEEK' },
                            { title: t('common.per_month'), value: 'PER_MONTH' },
                            { title: t('common.per_year'), value: 'PER_YEAR' },
                        ]
                    },
                    { name: 'schedule_amount', title: t('group.schedule_amount'), type: 'currency', defaultValue: 0 },
                ]
            },
        ]
    };
    const buttonItem: IButtonInfo = {
        cancel: { title: t('common.cancel'), link: '/group/security' },
        go: { title: t('common.apply') },
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: groupBreadcrumbs[group][0].label, href: groupBreadcrumbs[group][0].link },
                    {
                        label: `${t('group.create_group')}`,
                        href: `${groupBreadcrumbs[group][1].link}`,
                        active: true,
                    },
                ]}
            />
            <EditForm items={editItems[group]} buttons={buttonItem} action={createGroup} />
        </main>
    );
}
