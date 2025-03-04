import { notFound } from 'next/navigation';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import { UserForm } from '@/app/components/group/user-form';
import Breadcrumbs from '@/app/components/breadcrumbs';
import { ISearch, IBreadCrums } from '@/app/lib/definitions';
import { createGroup } from '@/app/lib/actionsGroup';
import getDictionary from '@/app/locales/dictionaries';
import { fetchUsersNotInGroup, fetchUsersNotInGroupPages, fetchUsersInGroup } from '@/app/lib/fetchGroupData';


export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ group: string, category: string, locale: "ko" | "en", id?:string }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const group = params.group;
    const groupId = params.id;
    const searchParams = await props.searchParams;
    const currentPage = Number(searchParams?.page) || 1;
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };

    const [t, outGroup, totalPages, inGroup] = await Promise.all([
        getDictionary(locale),
        fetchUsersNotInGroup(itemsPerPage, currentPage),
        fetchUsersNotInGroupPages(itemsPerPage),
        !!groupId ? fetchUsersInGroup(groupId) : []
    ]);

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
    const translated = {
        title_generals: t('common.generals'),
        desc_generas: t('comment.group_edit_group_name'),
        group_name: t('group.group_name'),
        placeholder_group_name: t('group.group_name_placeholder'),
        common_note: t('common.note'),
        title_schedule_quota: t('group.schedule_quota'),
        desc_schedule_quota: t('comment.group_edit_quota'),
        group_schedule_period: t('group.schedule_period'),
        none:t('common.none'),
        per_day:t('common.per_day'),
        per_week:t('common.per_week'),
        per_month:t('common.per_month'),
        per_year:t('common.per_year'),
        group_schedue_start: t('group.group_schedue_start'),
        sunday: t('common.sunday'),
        monday: t('common.monday'),
        tuesday: t('common.tuesday'),
        wednesday: t('common.wednesday'),
        thursday: t('common.thursday'),
        friday: t('common.friday'),
        saturday: t('common.saturday'),
        group_schedule_amount: t('group.schedule_amount'),
        button_cancel: t('common.cancel'),
        button_go: t('common.apply'),
        title_grouping: t('common.grouping'),
        group_member: t('group.group_members'),
        none_group_member: t('group.none_group_members'),
    };
    const deviceItems: ISection[] = [
        {
            title: t('common.generals'), description: [
                t('comment.group_edit_group_name'),
            ],
            items: [
                { name: 'group_name', title: t('group.group_name'), type: 'input', defaultValue: "" },
                { name: 'group_notes', title: t('common.note'), type: 'input', defaultValue: "" },
            ]
        },
    ];
    const deviceButtons: IButtonInfo = {
        go: {title: t('common.apply')},
        cancel: {title: t('common.cancel'), link: '/group/device'}
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
            {group === 'device' && <EditForm items={deviceItems} buttons={deviceButtons} action={createGroup} />}
            {group === 'user' &&
                <UserForm 
                    locale={locale}
                    translated={translated}
                    page={currentPage}
                    totalPages={totalPages}
                    outGroup={outGroup}
                    inGroup={inGroup}
                    action={createGroup} />
            }
            {group === 'security' && <EditForm items={deviceItems} buttons={deviceButtons} action={createGroup} />}
        </main>
    );
}
