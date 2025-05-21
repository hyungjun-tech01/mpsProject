import { notFound } from 'next/navigation';

import { ISection } from '@/app/components/edit-items';
import { ViewForm } from '@/app/components/group/view-form';
import Breadcrumbs from '@/app/components/breadcrumbs';
import { IGroupSearch, IBreadCrums } from '@/app/lib/definitions';
import { formatCurrency, formatDateForPerMonth, formatDateForPerYear } from '@/app/lib/utils';
import getDictionary from "@/app/locales/dictionaries";
import MyDBAdapter from '@/app/lib/adapter';
import { auth } from "@/auth";


export default async function Page(props: {
    searchParams?: Promise<IGroupSearch>;
    params: Promise<{ group: string, id: string, category: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const group = params.group;
    const id = params.id;
    const searchParams = await props.searchParams;
    const queryInGroup = searchParams?.queryInGroup || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentInPage = Number(searchParams?.inGroupPage) || 1;
    const session = await auth();

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };

    const manager = session?.user.name ?? "";

    const adapter = MyDBAdapter();
    const [
        t,
        data,
        inGroupData,
        inGroupTotalPages,
    ] = await Promise.all([
        getDictionary(locale),
        adapter.getGroupInfoById(id, group),
        group === "user"
            ? adapter.getUsersInGroup(id, queryInGroup, itemsPerPage, currentInPage)
            : group === "device"
                ? adapter.getDevicesInGroup(id, queryInGroup, itemsPerPage, currentInPage)
                : adapter.getDeptsInGroup(id, queryInGroup, itemsPerPage, currentInPage),
        group === "user"
            ? adapter.getUsersInGroupPages(id, queryInGroup, itemsPerPage)
            : group === "device"
                ? adapter.getDevicesInGroupPages(id, queryInGroup, itemsPerPage)
                : adapter.getDeptsInGroupPages(id, queryInGroup, itemsPerPage),
    ]);

    const inGroup = { paramName: 'inGroupPage', totalPages: inGroupTotalPages, members: inGroupData };

    const groupBreadcrumbs: {
        device: IBreadCrums[];
        user: IBreadCrums[];
        security: IBreadCrums[];
    } = {
        device: [
            { label: t("group.subTitle_device"), link: `/group/device` },
            { label: `${t("group.group_view")}`, link: `/group/device/${id}/view` },
        ],
        user: [
            { label: t("group.subTitle_user"), link: `/group/user` },
            { label: `${t("group.group_view")}`, link: `/group/user/${id}/view` },
        ],
        security: [
            { label: t("group.subTitle_security"), link: `/group/security` },
            { label: `${t("group.group_view")}`, link: `/group/security/${id}/view` },
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
        group_manager: t("group.group_manager"),
        group_schedule_amount: t("group.schedule_amount"),
        group_remain_amount: t("group.remain_amount"),
        button_cancel: t("common.cancel"),
        button_go: t("common.apply"),
        title_grouping: t("common.grouping"),
        group_member: t("group.group_members"),
        none_group_member: t("group.none_group_members"),
        search_placeholder_in_group: t("group.search_placeholder_in_group"),
        search_placeholder_in_nonegroup: t("group.search_placeholder_in_nonegroup"),
    };

    const translated_period = {
        NONE: translated.none,
        PER_DAY: translated.per_day,
        PER_WEEK: translated.per_week,
        PER_MONTH: translated.per_month,
        PER_YEAR: translated.per_year,
    };

    const translated_week = {
        '0': translated.sunday,
        '1': translated.monday,
        '2': translated.tuesday,
        '3': translated.wednesday,
        '4': translated.thursday,
        '5': translated.friday,
        '6': translated.saturday,
    }

    const contentsItems: { device: ISection[]; user: ISection[]; security: ISection[] } = {
        device: [
            {
                title: t("common.generals"),
                description: [t("comment.group_edit_group_name")],
                items: [
                    {
                        name: "group_name",
                        title: t("group.group_name"),
                        type: "label",
                        defaultValue: data.group_name,
                    },
                    {
                        name: "group_notes",
                        title: t("common.note"),
                        type: "label",
                        defaultValue: data.group_notes,
                    },
                ],
            },
            {
                title: t("group.group_manager"),
                description: [],
                items: [
                    {
                        name: "group_manager",
                        title: t("group.group_manager"),
                        type: "label",
                        defaultValue: manager,
                    },
                ],
            },
        ],
        user: [
            {
                title: t("common.generals"),
                description: [t("comment.group_edit_group_name")],
                items: [
                    {
                        name: "group_name",
                        title: t("group.group_name"),
                        type: "label",
                        defaultValue: data.group_name,
                    },
                    {
                        name: "group_notes",
                        title: t("common.note"),
                        type: "label",
                        defaultValue: data.group_notes,
                    },
                ],
            }
        ],
        security: [
            {
                title: t("common.generals"),
                description: [t("comment.group_edit_group_name")],
                items: [
                    {
                        name: "group_name",
                        title: t("group.group_name"),
                        type: "label",
                        defaultValue: data.group_name,
                    },
                    {
                        name: "group_notes",
                        title: t("common.note"),
                        type: "label",
                        defaultValue: data.group_notes,
                    },
                ],
            },
            {
                title: t("group.group_manager"),
                description: [],
                items: [
                    {
                        name: "group_manager",
                        title: t("group.group_manager"),
                        type: "label",
                        defaultValue: manager,
                    },
                ],
            },
        ],
    };

    const userSubItem = [
        {
            name: "schedule_period",
            title: t("group.schedule_period"),
            type: "label",
            defaultValue: translated_period[data.schedule_period],
        }
    ];
    if(data.schedule_period === 'PER_WEEK') {
        userSubItem.push({
            name: "schedule_start",
            title: t("group.group_schedue_start"),
            type: "label",
            defaultValue: translated_week[data.schedule_start],
        })
    };
    if(data.schedule_period === 'PER_MONTH') {
        userSubItem.push({
            name: "schedule_start",
            title: t("group.group_schedue_start"),
            type: "label",
            defaultValue: formatDateForPerMonth(data.schedule_start, locale),
        })
    };
    if(data.schedule_period === 'PER_YEAR') {
        userSubItem.push({
            name: "schedule_start",
            title: t("group.group_schedue_start"),
            type: "label",
            defaultValue: formatDateForPerYear(data.schedule_start, locale),
        })
    };
    userSubItem.push({
        name: "schedule_amount",
        title: t("group.schedule_amount"),
        type: "label",
        defaultValue: formatCurrency(data.schedule_amount, locale),
    });
    userSubItem.push({
        name: "remain_amount",
        title: t("group.remain_amount"),
        type: "label",
        defaultValue: formatCurrency(data.remain_amount, locale),
    });

    contentsItems.user.push({
        title: t("group.schedule_quota"),
        description: [t("comment.group_edit_quota")],
        items: userSubItem,
    });

    contentsItems.user.push({
        title: t("group.group_manager"),
        description: [],
        items: [
            {
                name: "group_manager",
                title: t("group.group_manager"),
                type: "label",
                defaultValue: manager,
            },
        ],
    },)

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    {
                        label: groupBreadcrumbs[group][0].label,
                        href: groupBreadcrumbs[group][0].link,
                    },
                    {
                        label: `${groupBreadcrumbs[group][1].label}`,
                        href: `${groupBreadcrumbs[group][1].link}`,
                        active: true,
                    },
                ]}
            />
            {group === "device" && (
                <ViewForm
                    items={contentsItems.device}
                    translated={translated}
                    inGroup={inGroup}
                />
            )}
            {/* {group === "user" && (
            <UserForm
              id={id}
              userData={data}
              locale={locale}
              translated={translated}
              candidates={[]}
              outGroup={[]}
              inGroup={inGroup}
              action={adapter.modifyUserGroup}
              editable={false}
            />
          )} */}
            {group === "user" && (
                <ViewForm
                    items={contentsItems.user}
                    translated={translated}
                    inGroup={inGroup}
                />
            )}
            {group === "security" && (
                <ViewForm
                    items={contentsItems.security}
                    translated={translated}
                    inGroup={inGroup}
                />
            )}
        </main>
    );
}
