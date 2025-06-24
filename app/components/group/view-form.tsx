"use client";

import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import { IEditItem, ISection, EditItem } from "../edit-items";
import { DeviceGroup, SecurityGroup, UserGroup } from "@/app/lib/definitions";
import Search from "../search";
import Pagination from '../pagination';

export function ViewForm({
  items,
  translated,
  inGroup,
}: {
  items: ISection[];
  translated: Record<string, string>;
  inGroup: {
    paramName: string;
    totalPages: number;
    members: DeviceGroup[] | SecurityGroup[];
  };
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleMenuOpenInGroup = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    const foundIdx = inGroup.members.findIndex(member => member.id === event.currentTarget.id);
        if(foundIdx !== -1) {
            setShownMember(inGroup.members[foundIdx]);
        }
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setShownMember(null);
  };
  const menuId = 'member-detail-menu';
  const [shownMember, setShownMember] = useState<null | DeviceGroup | SecurityGroup | UserGroup>(null);

  const renderMenu = () => {
    if (!shownMember) return null;
    if ('device_type' in shownMember) {
      return (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          id={menuId}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Name : </span>
              <span className='text-gray-600'>{shownMember.name}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Model : </span>
              <span className='text-gray-600'>{shownMember.device_model}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Type : </span>
              <span className='text-gray-600'>{shownMember.device_type}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Device Funtion : </span>
              <span className='text-gray-600'>{shownMember.ext_device_function}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Physical Device ID : </span>
              <span className='text-gray-600'>{shownMember.physical_device_id}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Serial No. : </span>
              <span className='text-gray-600'>{shownMember.serial_number}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Device Status : </span>
              <span className='text-gray-600'>{shownMember.device_status}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Deleted : </span>
              <span className='text-gray-600'>{shownMember.deleted}</span>
            </div>
          </MenuItem>
        </Menu>
      )
    } else if ('full_name' in shownMember) {
      return (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          id={menuId}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>User Name : </span>
              <span className='text-gray-600'>{shownMember.name}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Full Name : </span>
              <span className='text-gray-600'>{shownMember.full_name}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Balance : </span>
              <span className='text-gray-600'>{shownMember.balance}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Restricted : </span>
              {/*<span className='text-gray-600'>{shownMember.restricted}</span>*/}
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Total Pages : </span>
              <span className='text-gray-600'>{shownMember.total_pages}</span>
            </div>
          </MenuItem>
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Total Jobs : </span>
              <span className='text-gray-600'>{shownMember.total_jobs}</span>
            </div>
          </MenuItem>
        </Menu>
      )
    } else if ('dept_name' in shownMember) {
      return (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          id={menuId}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
          <MenuItem>
            <div>
              <span className='mr-3 font-medium'>Dept Name : </span>
              <span className='text-gray-600'>{shownMember.dept_name}</span>
            </div>
          </MenuItem>
        </Menu>
      )
    }
    return null;
  };

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
                  error={null}
                />
              ))}
            </div>
          </div>
        );
      })}
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
                  pageName="pageInGroup"
                  queryName="queryInGroup"
                  placeholder={translated.search_placeholder_in_group}
                />
              </div>
            )}
            <div className="grow p-2 border rounded-lg bg-white flex-col overflow-auto">
              {inGroup.members.map((member, idx) => {
                const memberName = "member_" + idx;
                  return (
                    <div key={idx} className="flex justify-between">
                      <div
                        id={`name@${member.id}`}
                        className="bg-white text-black font-light pl-1 cursor-default"
                      >
                        {member.name}
                      </div>
                      <div 
                        id={member.id}
                        className="bg-white hover:cursor-pointer"
                        onClick={handleMenuOpenInGroup}
                      >
                        <SearchOutlined />
                      </div>
                      <input
                        type="hidden"
                        name={memberName}
                        value={member.id}
                      />
                    </div>
                  );
              })}
              <input type="hidden" name="member_length" value={inGroup.members.length} />
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
      { renderMenu() }
    </div>
  );
}
