'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from './pagination';
import { Menu } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IColumnData } from '@/app/lib/definitions';
import { formatCurrency, formatTimeToLocal , formatTimeSimple} from '../lib/utils';
import { UpdateButton, DeleteButtton } from './buttons';
import Image from 'next/image';
import Link from 'next/link';
import {useState, useEffect} from 'react';

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
    rows: Record<string, string | number | Date | string[] | boolean | React.ReactElement | null>[];
    totalPages: number;
    path?: string;
    sesseionUserName?: string;
    locale?: 'ko' | 'en';
    deleteAction?: (id: string, param:string) => Promise<{message: string} | void>;
    editable?: boolean;
    deletable?: boolean;
    checkable?: boolean;
}


export default function CustomizedTable({
    columns,
    rows,
    totalPages,
    path,
    sesseionUserName,
    locale = 'ko',
    deleteAction,
    editable = true,
    deletable = true,
    checkable = false,
}: ITable) {
    const [chosenID, setChosenID] = React.useState<string>('');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
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

    const isMenuOpen = Boolean(anchorEl);
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        const deletedID = event.currentTarget.id.split('@').at(-1);
        if (!!deletedID)
            setChosenID(deletedID);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setChosenID('');
    };
    const menuId = 'delete-confirm-menu';
    const translate = {
        ko: {
            confirm_delete: '해당 item을 삭제합니다.',
            cancel: '취소',
            delete: '삭제',
        },
        en: {
            confirm_delete: 'Are you sure?',
            cancel: 'Cancel',
            delete: 'Delete',
        },
    };
    const renderMenu = !deleteAction ? null : (
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
            <div className='px-4 py-2'>{translate[locale].confirm_delete}</div>
            <div className='mb-2 flex justify-evenly'>
                <div className='mr-3 font-medium'>
                    <button className='border border-gray-300 rounded-md px-4 py-1' onClick={handleMenuClose} >
                        {translate[locale].cancel}
                    </button>
                </div>
                <div className='font-medium'>
                    <DeleteButtton id={chosenID} title={translate[locale].delete} deletedBy={sesseionUserName} ipAddress={ipAddress} action={deleteAction} />
                </div>
            </div>
        </Menu>
    );

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
    
    let columnLength = columns.length;
    if(checkable) columnLength += 1;
    if((editable || deletable)) columnLength += 1;
    
    const replaceThumbnailSrc = (imagePath:string|null):string => {

        if (!imagePath) return '';
 
         const found_idx = imagePath.lastIndexOf('.');
         if(found_idx !== -1){
             //const thumbnail_src = value?.slice(0, found_idx) + '_thumbnail.png';
             const nameWithoutExtension = imagePath.substring(0, found_idx);
             const thumbnail_src = 'api/file?filename='+ nameWithoutExtension + '.png'; 
             const replace_thumbnail_src = thumbnail_src.replace(/\\/g,'/');
             return replace_thumbnail_src;
         }else{    
             return '';
         }
     }

    return (
        <div style={{ marginTop: '1.5rem', display: 'flow-root' }}>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: "700px"}} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            {checkable && <StyledTableCell align='right' width={20} >{' '}</StyledTableCell>}
                            {columns.map((column, idx) => (
                                <StyledTableCell key={idx} align={column.align} width={column.width ?? 100}>
                                    {column.title}
                                </StyledTableCell>
                            ))}
                            {(editable || deletable) && <StyledTableCell align='right' width={20} >{' '}</StyledTableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length > 0 ? rows.map((row, idx) => {
                            return (
                                <StyledTableRow key={idx}>
                                    {checkable &&
                                        <StyledTableCell
                                            component="th"
                                            align='center'
                                            scope="row"
                                        >
                                            <input type="checkbox" id={String(row.id)} name={String(row.id)} />
                                        </StyledTableCell>
                                    }
                                    {columns.map((column) => {
                                        return (
                                            <StyledTableCell
                                                key={column.name}
                                                component="th"
                                                align={column.align}
                                                scope="row"
                                            >
                                                {!column.type && String(row[column.name])}
                                                {!!column.type && column.type === 'string' && 'A'+String(row[column.name])}
                                                {!!column.type && column.type === 'date' && formatTimeToLocal(String(row[column.name]), locale)}
                                                {!!column.type && column.type === 'date_simple' && formatTimeSimple(String(row[column.name]))}
                                                {!!column.type && column.type === 'currency' && formatCurrency(String(row[column.name]), locale)}
                                                {!!column.type && column.type === 'list' && (row[column.name] as string[]).map((item, idx) => (<div key={idx}>{item}</div>))}
                                                {!!column.type && column.type === 'file' &&
                                                    <div className='hover:cursor-pointer text-lime-700'
                                                        onClick={() => handleFileClick(String(row[column.name]))}>{String(row.name)}</div>
                                                }
                                                {!!column.type && column.type === 'icon' &&
                                                    <div className='flex justify-center'><Image src={`/${row[column.name]}`} alt="icon" width={24} height={24} className="w-6 h-6" /></div>
                                                }
                                                {!!column.type && column.type === 'enum_icon' &&
                                                    <div className='flex justify-center'>{(column.values as Record<string, React.ReactElement>)[String(row[column.name])]}</div>
                                                }
                                                {!!column.type && column.type === 'hidden' &&
                                                    <div className='flex justify-center'>{String(row[column.name])}</div>
                                                }
                                                {!!column.type && column.type === 'edit' &&
                                                    <Link href={`${path}/${row.id}/edit`} className='flex justify-center text-lime-700'>{String(row[column.name])}</Link>
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
                                                    className="w-24 h-18"
                                                    onError={(e) => e.currentTarget.src = '/fallback-image.png'} 
                                                    unoptimized
                                                />
                                                </div>
                                                }
                                            </StyledTableCell>
                                        )
                                    })}
                                    {(editable || deletable) &&
                                        <StyledTableCell
                                            component="th"
                                            align='right'
                                            scope="row"
                                        >
                                            <div className="flex justify-center gap-3">
                                                {editable && path && <UpdateButton
                                                    link={`${path}/${row.id}/edit`}
                                                />}
                                                {deletable && deleteAction &&
                                                    <button
                                                        id={`delete@${row.id}`}
                                                        className="rounded-md border p-2 hover:bg-gray-100"
                                                        onClick={handleMenuOpen}
                                                    >
                                                        <span className="sr-only">Delete</span>
                                                        <DeleteIcon className="w-5 text-inherit"
                                                        />
                                                    </button>
                                                }
                                            </div>
                                        </StyledTableCell>
                                    }
                                </StyledTableRow>
                        )})
                        :
                            <StyledTableRow>
                                <StyledTableCell
                                    colSpan={columnLength}
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