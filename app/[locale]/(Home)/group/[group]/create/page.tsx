import { notFound } from "next/navigation";

import { IButtonInfo, ISection } from "@/app/components/edit-items";
import { EditForm } from "@/app/components/group/edit-form";
import { UserForm } from "@/app/components/group/user-form";
import Breadcrumbs from "@/app/components/breadcrumbs";
import { IGroupSearch, IBreadCrums, Group } from "@/app/lib/definitions";
import { createDeviceGroup, createUserGroup, createSecurityGroup } from "@/app/lib/actionsGroup";
import getDictionary from "@/app/locales/dictionaries";
import {
  fetchUsersNotInGroup,
  fetchUsersNotInGroupPages,
  fetchDevicesNotInGroup,
  fetchDeviesNotInGroupPages,
  fetchDeptsNotInGroup,
  fetchDeptsNotInGroupPages
} from "@/app/lib/fetchGroupData";


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

  const [t, outGroupData, totalPages] = await Promise.all([
    getDictionary(locale),
    group === "user"
      ? fetchUsersNotInGroup(query, itemsPerPage, currentPage)
      : group === "device"
        ? fetchDevicesNotInGroup(query, itemsPerPage, currentPage)
        : fetchDeptsNotInGroup(query, itemsPerPage, currentPage),
    group === "user"
      ? fetchUsersNotInGroupPages(query, itemsPerPage)
      : group === "device"
        ? fetchDeviesNotInGroupPages(query, itemsPerPage)
        : fetchDeptsNotInGroupPages(query, itemsPerPage),
  ]);

  const dummyData : Group = {
    group_id: "",
    group_name: "",
    group_type: group,
    group_notes: "",
    schedule_period: "NONE",
    schedule_amount: 0,
    schedule_start: 0
  }

  const outGroup = { paramName: 'page', totalPages: totalPages, members: outGroupData };

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
    group_schedule_amount: t("group.schedule_amount"),
    button_cancel: t("common.cancel"),
    button_go: t("common.apply"),
    title_grouping: t("common.grouping"),
    group_member: t("group.group_members"),
    none_group_member: t("group.none_group_members"),
    search_placeholder_in_group: t("group.search_placeholder_in_group"),
    search_placeholder_in_nonegroup: t("group.search_placeholder_in_nonegroup")
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
        <EditForm
          items={contentsItems.device}
          buttons={buttonItems}
          translated={translated}
          outGroup={outGroup}
          inGroup={null}
          action={createDeviceGroup}
        />
      )}
      {group === "user" && (
        <UserForm
          locale={locale}
          userData={dummyData}
          translated={translated}
          outGroup={outGroup}
          inGroup={null}
          action={createUserGroup}
        />
      )}
      {group === "security" && (
        <EditForm
          items={contentsItems.security}
          buttons={buttonItems}
          translated={translated}
          outGroup={outGroup}
          inGroup={null}
          action={createSecurityGroup}
        />
      )}
    </main>
  );
}
