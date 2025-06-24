import { notFound } from "next/navigation";

import { IButtonInfo, ISection } from "@/app/components/edit-items";
import { EditGroupForm } from "@/app/components/group/edit-form";
import { EditUserGroupForm } from "@/app/components/group/user-form";
import Breadcrumbs from "@/app/components/breadcrumbs";
import { IGroupSearch, IBreadCrums } from "@/app/lib/definitions";
import getDictionary from "@/app/locales/dictionaries";
import MyDBAdapter from '@/app/lib/adapter';


export default async function Page(props: {
  searchParams?: Promise<IGroupSearch>;
  params: Promise<{
    group: string;
    id: string;
    category: string;
    locale: "ko" | "en";
  }>;
}) {
  const params = await props.params;
  const locale = params.locale;
  const group = params.group;
  const id = params.id;
  const searchParams = await props.searchParams;
  const queryOutGroup = searchParams?.queryOutGroup || "";
  const queryInGroup = searchParams?.queryInGroup || "";
  const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
  const currentOutPage = Number(searchParams?.outGroupPage) || 1;
  const currentInPage = Number(searchParams?.inGroupPage) || 1;

  if (!["device", "user", "security"].includes(group)) {
    notFound();
  }

  const adapter = MyDBAdapter();
  const [
    t,
    data,
    users,
    outGroupData,
    outGroupTotalPages,
    inGroupData,
    inGroupTotalPages,
  ] = await Promise.all([
    getDictionary(locale),
    adapter.getGroupInfoById(id, group),
    adapter.getAllUsers(),
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

  // console.log("[Group Edit] data:", data);
  // console.log("[Group Edit] Non-Group:", outGroupData);
  // console.log("[Group Edit] Group Data:", inGroupData);
  // console.log("[Group Edit] Group Pages:", inGroupTotalPages);

  const userOptions: { value: string, title: string }[] = [
    { value: "", title: t("group.select_group_manager") },
    ...users
    .filter(user => user.user_id !== null && user.user_name !== null)
    .map((item) => (
      { value: String(item.user_id), title: item.user_name }))
  ];

  const outGroup = {
    paramName: "outGroupPage",
    totalPages: outGroupTotalPages,
    members: outGroupData,
  };

  const inGroup = {
    paramName: "inGroupPage",
    totalPages: inGroupTotalPages,
    members: inGroupData,
  };

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

  const contentsItems: { device: ISection[]; security: ISection[] } = {
    device: [
      {
        title: t("common.generals"),
        description: [t("comment.group_edit_group_name")],
        items: [
          {
            name: "group_name",
            title: t("group.group_name"),
            type: "input",
            defaultValue: data.group_name,
          },
          {
            name: "group_notes",
            title: t("common.note"),
            type: "input",
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
            type: "select",
            defaultValue: data.manager_id,
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
            defaultValue: data.group_name,
          },
          {
            name: "group_notes",
            title: t("common.note"),
            type: "input",
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
            type: "select",
            defaultValue: data.manager_id,
            options: userOptions
          },
        ],
      },
    ],
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
            label: groupBreadcrumbs[group as keyof typeof groupBreadcrumbs][0].label,
            href: groupBreadcrumbs[group as keyof typeof groupBreadcrumbs][0].link,
          },
          {
            label: `${t("group.group_edit")}`,
            href: `${groupBreadcrumbs[group as keyof typeof groupBreadcrumbs][1].link}`,
            active: true,
          },
        ]}
      />
      {group === "device" && (
        <EditGroupForm
          id={id}
          items={contentsItems.device}
          buttons={buttonItems}
          translated={translated}
          outGroup={outGroup}
          inGroup={inGroup}
          action={adapter.modifyDeviceGroup}
        />
      )}
      {group === "user" && (
        <EditUserGroupForm
          id={id}
          userData={data}
          locale={locale}
          translated={translated}
          candidates={userOptions}
          outGroup={outGroup}
          inGroup={inGroup}
          action={adapter.modifyUserGroup}
        />
      )}
      {group === "security" && (
        <EditGroupForm
          id={id}
          items={contentsItems.security}
          buttons={buttonItems}
          translated={translated}
          outGroup={outGroup}
          inGroup={inGroup}
          action={adapter.modifySecurityGroup}
        />
      )}
    </main>
  );
}
