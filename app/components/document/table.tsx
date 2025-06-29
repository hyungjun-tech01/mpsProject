'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useActionState } from 'react';

import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '../pagination';
import { Menu } from '@mui/material';
import { DeleteOutlined, ShareOutlined } from '@mui/icons-material';

import { IColumnData } from '@/app/lib/definitions';
import { formatTimeToLocal } from '@/app/lib/utils';
import { DeleteButtton } from '@/app/components/buttons';
import type { BasicState } from '@/app/lib/actions';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 15,
        overflow: "hidden",
        whiteSpace: "nowrap",
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 15,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

interface ITable {
    columns: IColumnData[];
    rows: Record<string, string | number | Date | boolean | React.ReactElement | null>[];
    totalPages: number;
    path?: string;
    locale?: 'ko' | 'en';
    currentUserName: string;
    userOptions: { value: string, title: string }[];
    deleteAction: (id: string, param:string) => Promise<{message: string} | void>;
    shareAction: (initState: void | BasicState, formData: FormData) => Promise< BasicState | void>;
};

export default function CustomizedTable({
    columns,
    rows,
    totalPages,
    path,
    locale = 'ko',
    currentUserName,
    userOptions,
    deleteAction,
    shareAction,
}: ITable) {
    const [chosenID, setChosenID] = useState<string>('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [menuType, setMenuType] = useState<'delete' | 'share'>('delete');
    const [ipAddress, setIpAddress] = useState('');

    const initialState: BasicState = { };
    const [state, formAction] = useActionState(shareAction, initialState);
    
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

    const isMenuOpen = Boolean(anchorEl);
    const menuId = 'delete-confirm-menu';
    const translate = {
        ko: {
            confirm_delete: '해당 item을 삭제합니다.',
            cancel: '취소',
            delete: '삭제',
            expire_date: '공유 기간',
            share: '공유하기',
            share_doc: '문서 공유',
            share_selected: '해당 item을 공유할 사용자를 선택하세요.',
        },
        en: {
            confirm_delete: 'Are you sure?',
            cancel: 'Cancel',
            delete: 'Delete',
            expire_date: 'Share Expire Date',
            share: 'Share',
            share_doc: 'Share Document',
            share_selected: 'Select users to share the selected item',
        },
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        const anchorElInfos = event.currentTarget.id.split('@');
        if (!!anchorElInfos.at(0)) setMenuType(anchorElInfos.at(0) as 'delete' | 'share');
        if (!!anchorElInfos.at(-1)) setChosenID(anchorElInfos.at(-1) as string);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuType('delete');
        setChosenID('');
    };

    const handleFileClick = async (filePath: string) => {
        // console.log("Check file path: ", filePath);
        const onlyfilename = filePath.split("\\").at(-1);
        const encodedPath = encodeURIComponent(filePath);
        const response = await fetch(`/api/file?filename=${encodedPath}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = onlyfilename || "download_file";
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const replaceThumbnailSrc = (imagePath: string | null): string => {
        if (!imagePath) return '';

        const found_idx = imagePath.lastIndexOf('.');
        if (found_idx !== -1) {
            //const thumbnail_src = value?.slice(0, found_idx) + '_thumbnail.png';
            const nameWithoutExtension = imagePath.substring(0, found_idx);
            const thumbnail_src = 'api/file?filename=' + nameWithoutExtension + '.png';
            const replace_thumbnail_src = thumbnail_src.replace(/\\/g, '/');
            return replace_thumbnail_src;
        } else {
            return '';
        }
    };

    const renderMenu = (
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
            {menuType === 'delete' ? (
                <div className='w-52'>
                    <div className='px-4 py-2'>{translate[locale].confirm_delete}</div>
                    <div className='mb-2 flex justify-evenly'>
                        <div className='mr-3 font-medium'>
                            <button className='border border-gray-300 rounded-md px-4 py-1' onClick={handleMenuClose} >
                                {translate[locale].cancel}
                            </button>
                        </div>
                        <div className='font-medium'>
                            <DeleteButtton id={chosenID} title={translate[locale].delete} deletedBy={currentUserName} ipAddress={ipAddress} action={deleteAction} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className='w-80'>
                    <form action={formAction} className='w-full'>
                        <div className='px-4 py-2 font-semibold text-lg bg-lime-900 text-white'>{translate[locale].share_doc}</div>
                        <div className='px-4 pt-4 flex flex-col items-stretch'>
                            <div className='font-medium'>{translate[locale].share_selected}</div>
                            <select multiple className='flex-1 border border-gray-300 rounded-md p-2 mt-1 min-h-36' name='users'>
                                {userOptions?.map((user) => (
                                    <option key={user.value} value={user.value}>{user.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className='px-4 py-4 flex flex-col items-stretch'>
                            <div className='font-medium'>{translate[locale].expire_date}</div>
                            <input type='date' name='expire_date' className='border border-gray-300 rounded-md p-2 mt-1' />
                        </div>
                        <input type='hidden' name='document_id' value={chosenID} />
                        <div id="input-error" aria-live="polite" aria-atomic="true">
                            {!!state?.message &&
                                <p className="mt-2 pl-4 text-sm text-red-500">
                                    {state.message}
                                </p>
                            }
                        </div>
                        <div className='flex justify-end w-full px-4 pb-2'>
                            <button type='submit' className='border border-gray-300 rounded-md px-4 py-1 bg-lime-700 text-white'>{translate[locale].share}</button>
                        </div>
                    </form>
                </div>
            )}
        </Menu>
    );

    return (
        <div style={{ marginTop: '1.5rem', display: 'flow-root' }}>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: "700px" }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, idx) => (
                                <StyledTableCell key={idx} align={column.align} width={column.width ?? 100}>
                                    {column.title}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align='right' width={20} >{' '}</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length > 0 ? rows.map((row, idx) => {
                            return (
                                <StyledTableRow key={idx}>
                                    {columns.map((column) => {
                                        return (
                                            <StyledTableCell
                                                key={column.name}
                                                component="th"
                                                align={column.align}
                                                scope="row"
                                            >
                                                {!column.type && String(row[column.name])}
                                                {!!column.type && column.type === 'date' && formatTimeToLocal(String(row[column.name]), locale)}
                                                {!!column.type && column.type === 'file' &&
                                                    <div className='hover:cursor-pointer text-lime-700'
                                                        onClick={() => handleFileClick(String(row[column.name]))}>{String(row.name)}</div>
                                                }
                                                {!!column.type && column.type === 'enum_icon' &&
                                                    <div className='flex justify-center'>{(column.values as Record<string, React.ReactElement>)[String(row[column.name])]}</div>
                                                }
                                                {!!column.type && column.type === 'view' &&
                                                    <Link href={`${path}/${row.id}/view`} className='flex justify-center text-lime-700'>{String(row[column.name])}</Link>
                                                }
                                                {!!column.type && column.type === 'thumbnail' &&
                                                    <div className='flex justify-center  bg-gray-200 border'>
                                                        <Image
                                                            src={`/${replaceThumbnailSrc(String(row[column.name]))}`}
                                                            alt="No Image"
                                                            width={96}
                                                            height={72}
                                                            className="w-24 h-[72px]"
                                                            onError={(e) => e.currentTarget.src = '/fallback-image.png'}
                                                            unoptimized
                                                        />
                                                    </div>
                                                }
                                            </StyledTableCell>
                                        )
                                    })}
                                    {!!row.deletable ? (
                                        <StyledTableCell
                                            component="th"
                                            align='right'
                                            scope="row"
                                        >
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    id={`share@${row.id}`}
                                                    className="rounded-md border p-2 hover:bg-gray-100"
                                                    onClick={handleMenuOpen}
                                                >
                                                    <span className="sr-only">Share</span>
                                                    <ShareOutlined className="w-5 text-inherit"
                                                    />
                                                </button>
                                                <button
                                                    id={`delete@${row.id}`}
                                                    className="rounded-md border p-2 hover:bg-gray-100"
                                                    onClick={handleMenuOpen}
                                                >
                                                    <span className="sr-only">Delete</span>
                                                    <DeleteOutlined className="w-5 text-inherit"
                                                    />
                                                </button>
                                            </div>
                                        </StyledTableCell>
                                    ):(
                                        <StyledTableCell
                                            component="th"
                                            align='right'
                                            scope="row"
                                        >
                                            {' '}
                                        </StyledTableCell>
                                    )}
                                </StyledTableRow>
                            )
                        })
                            :
                            <StyledTableRow>
                                <StyledTableCell
                                    colSpan={columns.length + 1}
                                    align="center"
                                >
                                    No Data
                                </StyledTableCell>
                            </StyledTableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="flex justify-center py-3">
                <Pagination totalPages={totalPages} />
            </div>
            {renderMenu}
        </div>
    );
}