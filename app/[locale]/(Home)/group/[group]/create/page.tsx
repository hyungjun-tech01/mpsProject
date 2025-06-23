import { notFound } from "next/navigation";

import { IButtonInfo, ISection } from "@/app/components/edit-items";
import { CreateGroupForm } from "@/app/components/group/create-form";
import { CreateUserGroupForm } from "@/app/components/group/create-user-form";
import Breadcrumbs from "@/app/components/breadcrumbs";
import { IGroupSearch, IBreadCrums, Group } from "@/app/lib/definitions";
import getDictionary from "@/app/locales/dictionaries";
import MyDBAdapter from '@/app/lib/adapter';


export default async function Page(props: {
  searchParams?: Promise<IGroupSearch>;
  params: Promise<{
    group: 'device' | 'user' | 'security';
    category: string;
    locale: "ko" | "en"
  }>;
}) {
  const params = await props.params;
  const locale = params.locale;
  const group = params.group;
  const searchParams = await props.searchParams;
  const query = searchParams?.queryOutGroup || '';
  const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
  const currentPage = Number(searchParams?.outGroupPage) || 1;

  if (!["device", "user", "security"].includes(group)) {
    notFound();
  };

  const adapter = MyDBAdapter();
  const [t, users, outGroupData, totalPages] = await Promise.all([
    getDictionary(locale),
    adapter.getAllUsers(),
    group === "user"
      ? adapter.getUsersNotInGroup(query, itemsPerPage, currentPage)
      : group === "device"
        ? adapter.getDevicesNotInGroup(query, itemsPerPage, currentPage)
        : adapter.getDeptsNotInGroup(query, itemsPerPage, currentPage),
    group === "user"
      ? adapter.getUsersNotInGroupPages(query, itemsPerPage)
      : group === "device"
        ? adapter.getDevicesNotInGroupPages(query, itemsPerPage)
        : adapter.getDeptsNotInGroupPages(query, itemsPerPage),
  ]);

  const userOptions: {value:string, title:string}[] = [
    {value:"", title:t("group.select_group_manager")},
    ...users
    .filter(user => user.user_id !== null && user.user_name !== null)
    .map((item) => (
    {value: String(item.user_id), title: item.user_name}))
  ];

  const dummyData : Group = {
    group_id: "",
    group_name: "",
    group_type: group,
    group_notes: "",
    manager_id: "",
    schedule_period: "NONE",
    schedule_amount: 0,
    schedule_start: 0,
    remain_amount: 0,
  }

  const outGroup = { paramName: 'outGroupPage', totalPages: totalPages, members: outGroupData };

  const groupBreadcrumbs: {
    device: IBreadCrums[];
    user: IBreadCrums[];
    security: IBreadCrums[];
  } = {
    device: [
      { label: t("group.subTitle_device"), link: `/group/device` },
      { label: `${t("group.create_group")}`, link: `/group/device/create` },
    ],
    user: [
      { label: t("group.subTitle_user"), link: `/group/user` },
      { label: `${t("group.create_group")}`, link: `/group/user/create` },
    ],
    security: [
      { label: t("group.subTitle_security"), link: `/group/security` },
      { label: `${t("group.create_group")}`, link: `/group/security/create` },
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
    button_cancel: t("common.cancel"),
    button_go: t("common.apply"),
    title_grouping: t("common.grouping"),
    group_member: t("group.group_members"),
    none_group_member: t("group.none_group_members"),
    search_placeholder_in_group: group === 'device' ? t("device.search_placeholder_grouping") : t("group.search_placeholder_in_group"),
    search_placeholder_in_nonegroup: group === 'device' ? t("device.search_placeholder_grouping") : t("group.search_placeholder_in_nonegroup")
  };

  const contentsItems: { device: ISection[], security: ISection[] } = {
    device: [
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
      {
        title: t("group.group_manager"),
        description: [],
        items: [
          {
            name: "group_manager",
            title: t("group.group_manager"),
            type: "select",
            defaultValue: "",
            options: userOptions
          },
        ],
      },
    ],
    security: [
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
      {
        title: t("group.group_manager"),
        description: [],
        items: [
          {
            name: "group_manager",
            title: t("group.group_manager"),
            type: "select",
            defaultValue: "",
            options: userOptions
          },
        ],
      },
    ]
  };

  const buttonItems: IButtonInfo = {
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
      {group === "device" && (
        <CreateGroupForm
          items={contentsItems.device}
          buttons={buttonItems}
          translated={translated}
          outGroup={outGroup}
          inGroup={null}
          action={adapter.createDeviceGroup}
        />
      )}
      {group === "user" && (
        <CreateUserGroupForm
          locale={locale}
          userData={dummyData}
          translated={translated}
          candidates={userOptions}
          outGroup={outGroup}
          inGroup={null}
          action={adapter.createUserGroup}
        />
      )}
      {group === "security" && (
        <CreateGroupForm
          items={contentsItems.security}
          buttons={buttonItems}
          translated={translated}
          outGroup={outGroup}
          inGroup={null}
          action={adapter.createSecurityGroup}
        />
      )}
    </main>
  );
}
