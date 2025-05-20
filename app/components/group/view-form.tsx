"use client";

import { useEffect, useState } from 'react';
import { IEditItem, ISection, EditItem } from "../edit-items";
import { DeviceGroup, SecurityGroup, UserGroup } from "@/app/lib/definitions";
import Search from "../search";
import Pagination from '../pagination';

export function ViewForm({
  id,
  items,
  translated,
  inGroup,
}: {
  id: string;
  items: ISection[];
  translated: object;
  inGroup: {
    paramName: string;
    totalPages: number;
    members: DeviceGroup[] | SecurityGroup[];
  } | null;
}) {
  const [group, setGroup] = useState<
    (DeviceGroup | UserGroup | SecurityGroup)[]
  >([]);
  return (
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
                  if (idx !== sec.description.length - 1) {
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
                  error={null}
                />
              ))}
            </div>
          </div>
        );
      })}
      {/* <Grouping
        title={translated.title_grouping}
        noneGroupMemberTitle={translated.none_group_member}
        noneGroupSearchPlaceholder={translated.search_placeholder_in_nonegroup}
        groupMemberTitle={translated.group_member}
        groupSearchPlaceholder={translated.search_placeholder_in_group}
        outGroup={outGroup}
        inGroup={inGroup}
        editable={editable}
      /> */}
      <div className={"w-full p-2 mb-4 flex md: flex-col"}>
        <div className="w-full">
          <div className="mb-5 text-xl font-semibold">
            {translated.title_grouping}
          </div>
        </div>
        <div className="w-full flex">
          <div className="h-96 flex-1 p-2 flex flex-col gap-2">
            <div className="flex-none pl-2 font-semibold">
              {translated.group_member}
            </div>
            {!!inGroup && (
              <div className="flex-none">
                <Search
                  pageName="pageOutGroup"
                  queryName="queryOutGroup"
                  placeholder={translated.search_placeholder_in_group}
                />
              </div>
            )}
            <div className="grow p-2 border rounded-lg bg-white flex-col overflow-auto">
              {group.map((member, idx) => {
                const memberName = "member_" + idx;
                if (!!selectedInGroup && selectedInGroup.id === member.id) {
                  return (
                    <div key={idx} className="flex justify-between">
                      <div
                        id={`name@${member.id}`}
                        className="bg-lime-700 text-white font-normal pl-1 rounded-l w-full cursor-default"
                        onClick={handleSelectInGroup}
                      >
                        {member.name}
                      </div>
                      {/* <SearchOutlined
                        id={member.id}
                        className="bg-lime-700 rounded-r"
                        onClick={handleMenuOpenInGroup}
                      /> */}
                      <input
                        key={member.id}
                        type="hidden"
                        name={memberName}
                        value={member.id}
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={idx} className="flex justify-between">
                      <div
                        id={`name@${member.id}`}
                        className="bg-white text-black font-light pl-1 cursor-default"
                        onClick={handleSelectInGroup}
                      >
                        {member.name}
                      </div>
                      <SearchOutlined
                        id={member.id}
                        className="bg-white"
                        onClick={handleMenuOpenInGroup}
                      />
                      <input
                        type="hidden"
                        name={memberName}
                        value={member.id}
                      />
                    </div>
                  );
                }
              })}
              <input type="hidden" name="member_length" value={group.length} />
            </div>
          </div>
        </div>
        <div className="w-full flex">
          <div className="w-20 flex-0 flex flex-col justify-center"> </div>
          <div className="flex-1 p-2 flex flex-col gap-2">
            {!!inGroup ? (
              <div className="flex-none flex justify-center py-2">
                <Pagination
                  paramName={inGroup.paramName}
                  totalPages={inGroup.totalPages}
                />
              </div>
            ) : (
              " "
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
