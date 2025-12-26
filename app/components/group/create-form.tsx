"use client";

import Link from "next/link";
import { Button } from "@mui/material";
import type { GroupState } from "@/app/lib/actionsGroup";
import { useActionState, useEffect, useState } from "react";
import { IButtonInfo, IEditItem, ISection, EditItem } from "../edit-items";
import { DeviceGroup, SecurityGroup, IGroupSearch } from "@/app/lib/definitions";
import Grouping from "../grouping";


export function CreateGroupForm({
  items,
  buttons,
  translated,
  currentPage,
  outGroup,
  inGroup,
  sessionUserName,
  searchParams,
  action,
}: {
  items: ISection[];
  buttons?: IButtonInfo;
  translated: Record<string, string>;
  currentPage: string;
  outGroup: { paramName: string, totalPages: number, members: DeviceGroup[] | SecurityGroup[] };
  inGroup: { paramName: string, totalPages: number, members: DeviceGroup[] | SecurityGroup[] } | null;
  sessionUserName: string;
  searchParams?: IGroupSearch;
  action: (
    prevState: void | GroupState,
    formData: FormData,
  ) => Promise<GroupState | void>;
}) {
  const initialState: GroupState = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  // ip address
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('/api/get-ip');
        const data = await res.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error('IP 가져오기 실패:', error);
      }
    };

    fetchIp();
  }, []);
  // ip address

  return (
    <form action={formAction}>
      <input type="hidden" name="ipAddress" value={ipAddress} />
      <input type="hidden" name="updatedBy" value={sessionUserName} />
      <div className="rounded-md bg-gray-50 p-4 md:p-4">
        {items.map((sec: ISection, idx) => {
          return (
            <div
              key={idx}
              className="w-full p-2 flex flex-col md:flex-row border-b"
            >
              <div className="w-full md:w-1/3 pb-4 md:pr-6">
                <div className="mb-5 text-xl font-semibold">{sec.title}</div>
                {typeof sec.description === "string" && (
                  <div className="text-sm">{sec.description}</div>
                )}
                {Array.isArray(sec.description) &&
                  sec.description.map((item, idx) => {
                    if (idx !== (sec.description as string[]).length - 1) {
                      return (
                        <div key={idx} className="text-sm mb-4">
                          {item}
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="text-sm">
                          {item}
                        </div>
                      );
                    }
                  })}
              </div>
              <div className="w-full md:w-2/3">
                {sec.items.map((item: IEditItem) => (
                  <EditItem
                    key={item.name}
                    name={item.name}
                    title={item.title}
                    type={item.type}
                    defaultValue={item.defaultValue}
                    placeholder={item.placeholder}
                    options={item.options}
                    locale={item.locale}
                    chartData={item.chartData}
                    other={item.other}
                    error={
                      !!state?.errors && !!state?.errors[item.name as keyof GroupState['errors']]
                        ? state?.errors[item.name as keyof GroupState['errors']]
                        : null
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}
        <Grouping
          title={translated.title_grouping}
          noneGroupMemberTitle={translated.none_group_member}
          noneGroupSearchPlaceholder={translated.search_placeholder_in_nonegroup}
          groupMemberTitle={translated.group_member}
          groupSearchPlaceholder={translated.search_placeholder_in_group}
          currentPage={currentPage}
          outGroup={outGroup}
          inGroup={inGroup}
          searchParams={searchParams}
        />
        <div id="input-error" aria-live="polite" aria-atomic="true">
          {!!state?.message && (
            <p className="mt-2 text-sm text-red-500">{state.message}</p>
          )}
        </div>
      </div>
      {!!buttons && (
        <div className="mt-4 flex justify-end gap-4">
          {!!buttons.cancel && (
            <Link
              href={buttons.cancel.link}
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              {buttons.cancel.title}
            </Link>
          )}
          {!!buttons.go && (
            <Button
              type="submit"
              className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
            >
              {buttons.go.title}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
