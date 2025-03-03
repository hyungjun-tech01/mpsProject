'use client';

import { useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Button, Pagination } from '@mui/material';
import { ArrowForwardOutlined, ArrowBackOutlined } from '@mui/icons-material';


export default function Grouping({
    title,
    noneGroupMemberTitle,
    groupMemberTitle,
    currentPage,
    totalPages,
    outGroup,
    inGroup,
}: {
    title: string;
    noneGroupMemberTitle: string;
    groupMemberTitle: string;
    currentPage: number;
    totalPages: number;
    outGroup: { id: string, name: string }[];
    inGroup: { id: string, name: string }[];
}) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const goSelectedPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const [nonGroup, setNonGroup] = useState(outGroup);
    const [group, setGroup] = useState(inGroup);
    const [selectedInNoneGroup, setSelectedInNoneGroup] = useState<{ id: string, name: string } | null>(null);
    const [selectedInGroup, setSelectedInGroup] = useState<{ id: string, name: string } | null>(null);

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
            ...group,
        ];
        setGroup(updateGroup);

        setSelectedInGroup(selected);
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

        setSelectedInNoneGroup(selected);
        setSelectedInGroup(null);

    };

    const handleSelectInNoneGroup = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!event.target) return;

        const target = event.target as HTMLDivElement;
        if (!target.id) return;

        const targetId = target.id;
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

        const targetId = target.id;
        const foundIdx = group.findIndex(member => member.id === targetId);
        if (foundIdx === -1) return;

        if (!!selectedInGroup && selectedInGroup.id === targetId) {
            setSelectedInGroup(null);
        } else {
            setSelectedInGroup(group[foundIdx]);
        }
    };

    return (
        <div className={'w-full p-2 flex flex-col'}>
            <div className='w-full'>
                <div className='mb-5 text-xl font-semibold'>{title}</div>
            </div>
            <div className='w-full h-64 flex'>
                <div className='grow p-2 mr-2 flex-col'>
                    <div className='mb-2 pl-2 font-semibold'>{noneGroupMemberTitle}</div>
                    <div className='grow h-full p-2 mr-2 border rounded-lg bg-white flex-col overflow-auto'>
                        {nonGroup.map(member => {
                            if (!!selectedInNoneGroup && selectedInNoneGroup.id === member.id) {
                                return <div
                                    key={member.id}
                                    id={member.id}
                                    className='bg-lime-700 text-white font-semibold'
                                    onClick={handleSelectInNoneGroup}
                                >
                                    {member.name}
                                </div>
                            } else {
                                return <div
                                    key={member.id}
                                    id={member.id}
                                    className='bg-white text-black'
                                    onClick={handleSelectInNoneGroup}
                                >
                                    {member.name}
                                </div>
                            }
                        })}
                    </div>
                    <div className="flex justify-center">
                        <Pagination
                            count={totalPages}
                            shape="rounded"
                            page={currentPage}
                            onChange={(event: React.ChangeEvent, page: number) => goSelectedPage(page)}
                        />
                    </div>
                </div>
                <div className='grou-0 w-20 p-2 flex-0 flex flex-col justify-center'>
                    <Button
                        className='h-8 border rounded-lg mb-2'
                        onClick={handleMemberInGroup}
                    >
                        <ArrowForwardOutlined />
                    </Button>
                    <Button
                        className='h-8 border rounded-lg'
                        onClick={handleMemberOutGroup}
                    >
                        <ArrowBackOutlined />
                    </Button>
                </div>
                <div className='grow p-2 ml-2 flex-col'>
                    <div className='mb-2 pl-2 font-semibold'>{groupMemberTitle}</div>
                    <div className='grow h-full p-2 ml-2 border rounded-lg bg-white flex-col overflow-auto'>
                        {group.map(member => {
                            if (!!selectedInGroup && selectedInGroup.id === member.id) {
                                return <div
                                    key={member.id}
                                    id={member.id}
                                    className='bg-lime-700 text-white font-semibold'
                                    onClick={handleSelectInGroup}
                                >
                                    {member.name}
                                </div>
                            } else {
                                return <div
                                    key={member.id}
                                    id={member.id}
                                    className='bg-white text-black'
                                    onClick={handleSelectInGroup}
                                >
                                    {member.name}
                                </div>
                            }
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}