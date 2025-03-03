'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import { ArrowForwardOutlined, ArrowBackOutlined } from '@mui/icons-material';


export default function Grouping({
    title,
    noneGroupMemberTitle,
    groupMemberTitle,
    page,
    outGroup,
    inGroup,
}: {
    title: string;
    noneGroupMemberTitle: string;
    groupMemberTitle: string;
    page: number;
    outGroup: {id:string, name:string}[];
    inGroup: {id:string, name:string}[];
}) {
    const [nonGroup, setNonGroup] = useState(outGroup)
    return (
        <div className={'w-full p-2 flex flex-col'}>
            <div className='w-full'>
                <div className='mb-5 text-xl font-semibold'>{title}</div>
            </div>
            <div className='w-full h-64 flex'>
                <div className='grow p-2 mr-2 flex-col'>
                    <div className='mb-2 pl-2 font-semibold'>{noneGroupMemberTitle}</div>
                    <div className='grow h-full p-2 mr-2 border rounded-lg bg-white flex-col overflow-auto'>
                        {outGroup.map(member => (
                            <div key={member.id}>{member.name}</div>
                        ))}
                    </div>
                </div>
                <div className='grou-0 w-20 p-2 flex-0 flex flex-col justify-center'>
                    <Button className='h-8 border rounded-lg mb-2'><ArrowForwardOutlined /></Button>
                    <Button className='h-8 border rounded-lg'><ArrowBackOutlined /></Button>
                </div>
                <div className='grow p-2 ml-2 flex-col'>
                    <div className='mb-2 pl-2 font-semibold'>{groupMemberTitle}</div>
                    <div className='grow h-full p-2 ml-2 border rounded-lg bg-white flex-col overflow-auto'>
                        {inGroup.map(member => (
                            <div key={member.id}>{member.name}</div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}