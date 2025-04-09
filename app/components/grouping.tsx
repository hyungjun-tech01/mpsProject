'use client';

import { useEffect, useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import { ArrowForwardOutlined, ArrowBackOutlined, SearchOutlined } from '@mui/icons-material';
import Pagination from './pagination';
import Search from './search';
import { DeviceGroup, UserGroup, SecurityGroup } from '../lib/definitions';


export default function Grouping({
    title,
    noneGroupMemberTitle,
    noneGroupSearchPlaceholder,
    groupMemberTitle,
    groupSearchPlaceholder,
    outGroup,
    inGroup,
}: {
    title: string;
    noneGroupMemberTitle: string;
    noneGroupSearchPlaceholder: string;
    groupMemberTitle: string;
    groupSearchPlaceholder: string;
    outGroup: { paramName: string, totalPages: number, members: DeviceGroup[] | UserGroup[] | SecurityGroup[] };
    inGroup: { paramName: string, totalPages: number, members: DeviceGroup[] | UserGroup[] | SecurityGroup[] } | null;
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleMenuOpenOutGroup = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        const foundIdx = nonGroup.findIndex(member => member.id === event.currentTarget.id);
        if(foundIdx !== -1) {
            setShownMember(nonGroup[foundIdx]);
        }
    };
    const handleMenuOpenInGroup = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        const foundIdx = group.findIndex(member => member.id === event.currentTarget.id);
        if(foundIdx !== -1) {
            setShownMember(nonGroup[foundIdx]);
        }
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setShownMember(null);
    };
    const menuId = 'member-detail-menu';
    const [shownMember, setShownMember] = useState<null | DeviceGroup | SecurityGroup | UserGroup>(null);
    
    const renderMenu = () => {
        if(!shownMember) return null;
        if('device_type' in shownMember) {
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
        } else if('full_name' in shownMember) {
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
                            <span className='text-gray-600'>{shownMember.user_name}</span>
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
                            <span className='text-gray-600'>{shownMember.restricted}</span>
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
        } else if('dept_name' in shownMember) {
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

    const [nonGroup, setNonGroup] = useState<(DeviceGroup | UserGroup | SecurityGroup)[]>([]);
    const [group, setGroup] = useState<(DeviceGroup | UserGroup | SecurityGroup)[]>([]);
    const [selectedInNoneGroup, setSelectedInNoneGroup] = useState<DeviceGroup | UserGroup | SecurityGroup | null>(null);
    const [selectedInGroup, setSelectedInGroup] = useState<DeviceGroup | UserGroup | SecurityGroup | null>(null);

    const handleMemberInGroup = () => {
        if (!selectedInNoneGroup) return;
        const selected = selectedInNoneGroup;
        const foundIdx = nonGroup.findIndex(member => member.id === selected.id);
        if (foundIdx === -1) return;

        const updateNonGroup = [
            ...nonGroup.slice(0, foundIdx),
            ...nonGroup.slice(foundIdx + 1,)
        ];
        setNonGroup(updateNonGroup);

        const updateGroup = [
            selectedInNoneGroup,
            ...group
        ];
        setGroup(updateGroup);

        setSelectedInGroup(null);
        setSelectedInNoneGroup(null);
    };

    const handleMemberOutGroup = () => {
        if (!selectedInGroup) return;
        const selected = selectedInGroup;
        const foundIdx = group.findIndex(member => member.id === selected.id);
        if (foundIdx === -1) return;

        const updateGroup = [
            ...group.slice(0, foundIdx),
            ...group.slice(foundIdx + 1,)
        ];
        setGroup(updateGroup);

        const updateNonGroup = [
            selected,
            ...nonGroup,
        ];
        setNonGroup(updateNonGroup);

        setSelectedInNoneGroup(null);
        setSelectedInGroup(null);

    };

    const handleSelectInNoneGroup = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!event.target) return;

        const target = event.target as HTMLDivElement;
        if (!target.id) return;

        const targetId = target.id.split('@')[1];
        const foundIdx = nonGroup.findIndex(member => member.id === targetId);
        if (foundIdx === -1) return;

        if (!!selectedInNoneGroup && selectedInNoneGroup.id === targetId) {
            setSelectedInNoneGroup(null);
        } else {
            setSelectedInNoneGroup(nonGroup[foundIdx]);
        }
    };

    const handleSelectInGroup = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!event.target) return;

        const target = event.target as HTMLDivElement;
        if (!target.id) return;

        const targetId = target.id.split('@')[1];
        const foundIdx = group.findIndex(member => member.id === targetId);
        if (foundIdx === -1) return;

        if (!!selectedInGroup && selectedInGroup.id === targetId) {
            setSelectedInGroup(null);
        } else {
            setSelectedInGroup(group[foundIdx]);
        }
    };

    useEffect(() => {
        // console.log('Grouping / check Group : ', inGroup);
        const updatedOutGroup = outGroup.members.filter(item => group.findIndex(member => member.id === item.id) === -1);
        setNonGroup(updatedOutGroup);

        const checkInGroup = !!inGroup ? inGroup.members.filter(item => group.findIndex(member => member.id === item.id) === -1) : [];
        const updatedInGroup = [...checkInGroup, ...group];
        setGroup(updatedInGroup);
    }, [outGroup, inGroup]);

    return (
        <div className={'w-full p-2 mb-4 flex md: flex-col'}>
            <div className='w-full'>
                <div className='mb-5 text-xl font-semibold'>{title}</div>
            </div>
            <div className='w-full flex'>
                <div className='h-96 flex-1 p-2 flex flex-col gap-2'>
                    <div className='flex-none pl-2 font-semibold'>{noneGroupMemberTitle}</div>
                    <div className='flex-none'>
                        <Search pageName='pageOutGroup' queryName='queryOutGroup' placeholder={noneGroupSearchPlaceholder} />
                    </div>
                    <div className='grow p-2 border rounded-lg bg-white flex-col overflow-auto'>
                        {nonGroup.map((member, idx) => {
                            if (!!selectedInNoneGroup && selectedInNoneGroup.id === member.id) {
                                return (
                                <div key={idx} className='flex justify-between'>
                                    <div
                                        id={`name@${member.id}`}
                                        className='bg-lime-700 text-white font-normal pl-1 rounded-l w-full  cursor-default'
                                        onClick={handleSelectInNoneGroup}
                                    >
                                        {member.name}
                                    </div>
                                    <SearchOutlined id={member.id}  className='bg-lime-700 rounded-r' onClick={handleMenuOpenOutGroup} />
                                </div>
                            )} else {
                                return ( 
                                    <div key={idx} className='flex justify-between'>
                                        <div
                                            id={`name@${member.id}`}
                                            className='bg-white text-black font-light pl-1 cursor-default'
                                            onClick={handleSelectInNoneGroup}
                                        >
                                            {member.name}
                                        </div>
                                        <SearchOutlined id={member.id} className='bg-white' onClick={handleMenuOpenOutGroup} />
                                    </div>
                            )}
                        })}
                    </div>
                </div>
                <div className='w-20 flex-0 flex flex-col justify-center'>
                    <Button
                        className='h-8 border rounded-lg mb-2 mx-2 hover:bg-lime-100'
                        onClick={handleMemberInGroup}
                    >
                        <ArrowForwardOutlined />
                    </Button>
                    <Button
                        className='h-8 border rounded-lg mx-2 hover:bg-lime-100'
                        onClick={handleMemberOutGroup}
                    >
                        <ArrowBackOutlined />
                    </Button>
                </div>
                <div className='h-96 flex-1 p-2 flex flex-col gap-2'>
                    <div className='flex-none pl-2 font-semibold'>{groupMemberTitle}</div>
                    {!!inGroup && <div className='flex-none'>
                            <Search pageName='pageOutGroup' queryName='queryOutGroup' placeholder={groupSearchPlaceholder} />
                        </div>
                    }
                    <div className='grow p-2 border rounded-lg bg-white flex-col overflow-auto'>
                        {group.map((member, idx) => {
                            const memberName = "member_" + idx;
                            if (!!selectedInGroup && selectedInGroup.id === member.id) {
                                return (
                                    <div key={idx} className='flex justify-between'>
                                        <div
                                            id={`name@${member.id}`}
                                            className='bg-lime-700 text-white font-normal pl-1 rounded-l w-full cursor-default'
                                            onClick={handleSelectInGroup}
                                        >
                                            {member.name}
                                        </div>
                                        <SearchOutlined id={member.id}  className='bg-lime-700 rounded-r' onClick={handleMenuOpenInGroup} />
                                        <input key={member.id} type="hidden" name={memberName} value={member.id} />
                                    </div>
                                )
                            } else {
                                return (
                                    <div key={idx} className='flex justify-between'>
                                        <div
                                            id={`name@${member.id}`}
                                            className='bg-white text-black font-light pl-1 cursor-default'
                                            onClick={handleSelectInGroup}
                                        >
                                            {member.name}
                                        </div>
                                        <SearchOutlined id={member.id}  className='bg-white' onClick={handleMenuOpenInGroup} />
                                        <input type="hidden" name={memberName} value={member.id} />
                                    </div>
                                )
                            }
                        })}
                        <input type="hidden" name="member_length" value={group.length} />
                    </div>
                </div>
            </div>
            <div className='w-full flex'>
                <div className='flex-1 p-2 flex flex-col gap-2'>
                    <div className="flex-none flex justify-center py-2">
                        <Pagination paramName={outGroup.paramName} totalPages={outGroup.totalPages} />
                    </div>
                </div>
                <div className='w-20 flex-0 flex flex-col justify-center'>{' '}</div>
                <div className='flex-1 p-2 flex flex-col gap-2'>
                    {!!inGroup ?
                        <div className="flex-none flex justify-center py-2">
                            <Pagination paramName={inGroup.paramName} totalPages={inGroup.totalPages} />
                        </div>
                        : ' '
                    }
                </div>
            </div>
            { renderMenu() }
        </div>
    )
}