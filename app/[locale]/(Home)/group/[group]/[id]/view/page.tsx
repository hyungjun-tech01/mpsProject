import { notFound } from 'next/navigation';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/group/edit-form';
import { UserForm } from '@/app/components/group/user-form';
import Breadcrumbs from '@/app/components/breadcrumbs';
import { IGroupSearch, IBreadCrums } from '@/app/lib/definitions';
import getDictionary from "@/app/locales/dictionaries";
import MyDBAdapter from '@/app/lib/adapter';


export default async function Page(props: {
    searchParams?: Promise<IGroupSearch>;
    params: Promise<{ group: string, id: string, category: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const group = params.group;
    const id = params.id;
    // const category = params.category;
    const searchParams = await props.searchParams;
    const queryOutGroup = searchParams?.queryOutGroup || '';
    const queryInGroup = searchParams?.queryInGroup || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentOutPage = Number(searchParams?.outGroupPage) || 1;
    const currentInPage = Number(searchParams?.inGroupPage) || 1;

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };

    const adapter = MyDBAdapter();
    const [t, outGroupData, outGroupTotalPages, inGroupData, inGroupTotalPages] = await Promise.all([
        getDictionary(locale),
        group === "user"
            ? adapter.getUsersNotInGroup(queryOutGroup, itemsPerPage, currentOutPage)
            : group === "device"
                ? adapter.getDevicesNotInGroup(queryOutGroup, itemsPerPage, currentOutPage)
                : adapter.getDeptsNotInGroup(queryOutGroup, itemsPerPage, currentOutPage),
        group === "user"
            ? adapter.getUsersNotInGroupPages(queryOutGroup, itemsPerPage)
            : group === "device"
                ? adapter.getDevicesNotInGroupPages(queryOutGroup, itemsPerPage)
                : adapter.getDeptsNotInGroupPages(queryOutGroup, itemsPerPage),
        group === "user"
            ? adapter.getUsersInGroup(id, queryInGroup, itemsPerPage, currentOutPage)
            : group === "device"
                ? adapter.getDevicesInGroup(id, queryInGroup, itemsPerPage, currentOutPage)
                : adapter.getDeptsInGroup(id, queryInGroup, itemsPerPage, currentOutPage),
        group === "user"
            ? adapter.getUsersInGroupPages(id, queryInGroup, itemsPerPage)
            : group === "device"
                ? adapter.getDevicesInGroupPages(id, queryInGroup, itemsPerPage)
                : adapter.getDeptsInGroupPages(id, queryInGroup, itemsPerPage),
    ]);

    const outGroup = { paramName: 'outGroupPage', totalPages: outGroupTotalPages, members: outGroupData };
    const inGroup = { paramName: 'inGroupPage', totalPages: inGroupTotalPages, members: inGroupData };

    // Tabs ----------------------------------------------------------------------
    // const subTitles = [
    //     { category: 'edit', title: t('group.group_details'), link: `/group/${group}/${id}/edit` },
    //     { category: 'members', title: t('group.group_members'), link: `/group/${group}/${id}/members` },
    // ];

    const groupBreadcrumbs: {
        device: IBreadCrums[];
        user: IBreadCrums[];
        security: IBreadCrums[];
    } = {
        device: [
            { label: t("group.subTitle_device"), link: `/group/device` },
            { label: `${t("group.group_edit")}`, link: `/group/device/${id}/edit` },
        ],
        user: [
            { label: t("group.subTitle_user"), link: `/group/user` },
            { label: `${t("group.group_edit")}`, link: `/group/user/${id}/edit` },
        ],
        security: [
            { label: t("group.subTitle_security"), link: `/group/security` },
            { label: `${t("group.group_edit")}`, link: `/group/security/${id}/edit` },
        ],
    };

    const translated = {
        title_generals: t("common.generals"),
        desc_generas: t("comment.group_edit_group_name"),
        group_name: t("group.group_name"),
        placeholder_group_name: t("group.group_name_placeholder"),
        common_note: t("common.note"),
        title_schedule_quota: t("group.schedule_quota"),
        desc_schedule_quota: t("comment.group_edit_quota"),
        group_schedule_period: t("group.schedule_period"),
        none: t("common.none"),
        per_day: t("common.per_day"),
        per_week: t("common.per_week"),
        per_month: t("common.per_month"),
        per_year: t("common.per_year"),
        group_schedue_start: t("group.group_schedue_start"),
        sunday: t("common.sunday"),
        monday: t("common.monday"),
        tuesday: t("common.tuesday"),
        wednesday: t("common.wednesday"),
        thursday: t("common.thursday"),
        friday: t("common.friday"),
        saturday: t("common.saturday"),
        group_schedule_amount: t("group.schedule_amount"),
        button_cancel: t("common.cancel"),
        button_go: t("common.apply"),
        title_grouping: t("common.grouping"),
        group_member: t("group.group_members"),
        none_group_member: t("group.none_group_members"),
    };

    const deviceItems: ISection[] = [
        {
            title: t("common.generals"),
            description: [t("comment.group_edit_group_name")],
            items: [
                {
                    name: "group_name",
                    title: t("group.group_name"),
                    type: "input",
                    defaultValue: "",
                },
                {
                    name: "group_notes",
                    title: t("common.note"),
                    type: "input",
                    defaultValue: "",
                },
            ],
        },
    ];

    const deviceButtons: IButtonInfo = {
        go: { title: t("common.apply") },
        cancel: { title: t("common.cancel"), link: "/group/device" },
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        label: groupBreadcrumbs[group][0].label,
                        href: groupBreadcrumbs[group][0].link,
                    },
                    {
                        label: `${t("group.create_group")}`,
                        href: `${groupBreadcrumbs[group][1].link}`,
                        active: true,
                    },
                ]}
            />
            {/* <div className='w-full pl-2 flex justify-start'>
                {subTitles.map((item, idx) => {
                    return <Link key={idx} href={item.link}
                        className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                            { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === category },
                            { "text-gray-300  bg-white border-2": item.category !== category },
                        )}>{item.title}</Link>;
                })}
            </div> */}
            {group !== 'user' &&
                <EditForm
                    id={id}
                    items={deviceItems}
                    buttons={deviceButtons}
                    translated={translated}
                    totalPages={outGroupTotalPages}
                    outGroup={outGroup}
                    inGroup={inGroup}
                    action={adapter.modifyDeviceGroup}
                />
            }
            {group === 'members' &&
                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    <MemberTable
                        columns={members}
                        rows={inGroup}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        editable={false}
                    />
                </div>
            }
        </main>
    );
}
