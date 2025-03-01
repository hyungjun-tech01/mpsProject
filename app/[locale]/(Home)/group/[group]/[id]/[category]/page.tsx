import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/breadcrumbs';
import MemberTable from '@/app/components/table';
import { ISearch, IBreadCrums } from '@/app/lib/definitions';
import { modifyGroup } from '@/app/lib/actionsGroup';
import { fetchGroupInfoByID, fetchMembersInGroupByID, fetchMembersPagesByID } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ group: string, id: string, category: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const group = params.group;
    const id = params.id;
    const category = params.category;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };
    if (!['edit', 'members'].includes(category)) {
        notFound();
    };
    const [t, groupInfo, totalPages, members] = await Promise.all([
        getDictionary(locale),
        fetchGroupInfoByID(id, group),
        fetchMembersPagesByID(query, id, itemsPerPage),
        fetchMembersInGroupByID(query, id, itemsPerPage, currentPage),
    ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'edit', title: t('group.group_details'), link: `/group/${group}/${id}/edit` },
        { category: 'members', title: t('group.group_members'), link: `/group/${group}/${id}/members` },
    ];
    const groupBreadcrumbs: { device: IBreadCrums[], user: IBreadCrums[], security: IBreadCrums[] } = {
        device: [
            { label: t('group.subTitle_device'), link: `/group/device` },
            { label: `${t('group.group_edit')}`, link: `/group/device/${id}/edit` }
        ],
        user: [
            { label: t('group.subTitle_user'), link: `/group/user` },
            { label: `${t('group.group_edit')}`, link: `/group/user/${id}/edit` }
        ],
        security: [
            { label: t('group.subTitme_security'), link: `/group/security` },
            { label: `${t('group.group_edit')}`, link: `/group/security/${id}/edit` }
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
                    { name: 'group_name', title: t('group.group_name'), type: 'label', defaultValue: groupInfo.group_name },
                    { name: 'schedule_period', title: t('group.schedule_period'), type: 'select', defaultValue: groupInfo.schedule_period || '',
                        options: [
                            { title: t('common.none'), value: 'NONE' },
                            { title: t('common.per_day'), value: 'PER_DAY' },
                            { title: t('common.per_week'), value: 'PER_WEEK' },
                            { title: t('common.per_month'), value: 'PER_MONTH' },
                            { title: t('common.per_year'), value: 'PER_YEAR' },
                        ]
                    },
                    { name: 'schedule_amount', title: t('group.schedule_amount'), type: 'currency', defaultValue: groupInfo.schedule_amount },
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
                    { name: 'group_name', title: t('group.group_name'), type: 'label', defaultValue: groupInfo.group_name },
                    { name: 'schedule_period', title: t('group.schedule_period'), type: 'select', defaultValue: groupInfo.schedule_period,
                        options: [
                            { title: t('common.none'), value: 'NONE' },
                            { title: t('common.per_day'), value: 'PER_DAY' },
                            { title: t('common.per_week'), value: 'PER_WEEK' },
                            { title: t('common.per_month'), value: 'PER_MONTH' },
                            { title: t('common.per_year'), value: 'PER_YEAR' },
                        ]
                    },
                    { name: 'schedule_amount', title: t('group.schedule_amount'), type: 'currency', defaultValue: groupInfo.schedule_amount },
                ]
            },
        ],
        security: [
            {
                title: t('common.details'), description: t('comment.group_edit_device_description'),
                items: [
                    { name: 'group_name', title: t('group.group_name'), type: 'label', defaultValue: groupInfo.group_name },
                    { name: 'schedule_period', title: t('group.schedule_period'), type: 'select', defaultValue: groupInfo.schedule_period,
                        options: [t('common.per_day'), t('common.per_week'), t('common.per_month'), t('common.per_year') ] 
                    },
                    { name: 'schedule_amount', title: t('group.schedule_amount'), type: 'currency', defaultValue: groupInfo.schedule_amount },
                ]
            },
        ]
    };
    const buttonItems: { device: IButtonInfo, user: IButtonInfo, security: IButtonInfo } = {
        device: {
            cancel: { title: t('common.cancel'), link: '/group/device' },
            go: { title: t('group.update_group') },
        },
        user: {
            cancel: { title: t('common.cancel'), link: '/group/user' },
            go: { title: t('common.apply') },
        },
        security: {
            cancel: { title: t('common.cancel'), link: '/group/security' },
            go: { title: t('common.apply') },
        }
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: groupBreadcrumbs[group][0].label, href: groupBreadcrumbs[group][0].link },
                    {
                        label: `${t('group.group_edit')}`,
                        href: `${groupBreadcrumbs[group][1].link}`,
                        active: true,
                    },
                ]}
            />
            <div className='w-full pl-2 flex justify-start'>
                {subTitles.map((item, idx) => {
                    return <Link key={idx} href={item.link}
                        className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                            { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === category },
                            { "text-gray-300  bg-white border-2": item.category !== category },
                        )}>{item.title}</Link>;
                })}
            </div>
            {category === 'edit' && <EditForm id={id} items={editItems[group]} buttons={buttonItems[group]} action={modifyGroup} />}
            {category === 'members' &&
                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    <MemberTable
                        columns={members}
                        rows={members}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        editable={false}
                    />
                </div>
            }
        </main>
    );
}
