'use client';

import * as React from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import { Menu, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IColumnData } from '@/app/lib/definitions';
import { formatCurrency, formatTimeToLocal } from '../lib/utils';
import { UpdateButton, DeleteButtton } from './buttons';
import clsx from 'clsx';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        fontSize: 15,
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

interface ITable<DataType> {
    columns: IColumnData[];
    rows: DataType[];
    currentPage: number;
    totalPages: number;
    path?: string;
    locale?: 'ko' | 'en';
    deleteAction?: (id: string) => void;
    editable?: boolean;
    deletable?: boolean;
    checkable?: boolean;
}

export default function CustomizedTable<DataType>({
    columns,
    rows,
    currentPage,
    totalPages,
    path,
    locale = 'ko',
    deleteAction,
    editable = true,
    deletable = true,
    checkable = false,
}: ITable<DataType>) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const goSelectedPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const [chosenID, setChosenID] = React.useState<string>('');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorEl);
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        const deletedID = event.currentTarget.id.split('@').at(-1);
        if(!!deletedID)
            setChosenID(deletedID);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
        setChosenID('');
    };
    const menuId = 'delete-confirm-menu';
    const translate = {
        ko: {
            confirm_delete : '해당 item을 삭제합니다.',
            cancel: '취소',
            delete: '삭제',
        },
        en: {
            confirm_delete : 'Are you sure?',
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
                    <DeleteButtton id={chosenID} title={translate[locale].delete} action={deleteAction}/>
                    {/* <Button className='border border-gray-300 rounded-md'>
                        {translate[locale].delete}
                    </Button> */}
                </div>
            </div>
        </Menu>
    )

    return (
        <div style={{ marginTop: '1.5rem', display: 'flow-root' }}>
            <TableContainer component={Paper}>
                <Table className="min-w-[700px]" aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            {checkable && <StyledTableCell align='right'>{' '}</StyledTableCell>}
                            {columns.map((column, idx) => (
                                <StyledTableCell key={idx} align={column.align} >
                                    {column.title}
                                </StyledTableCell>
                            ))}
                            {(editable || deletable) && <StyledTableCell align='right'>{' '}</StyledTableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length > 0 && rows.map((row, idx) => {
                            return (
                                <StyledTableRow key={idx}>
                                    {checkable &&
                                        <StyledTableCell
                                            component="th"
                                            align='center'
                                            scope="row"
                                        >
                                            <input type="checkbox" id={row.id} name={row.id} />
                                        </StyledTableCell>
                                    }
                                    {columns.map((column) => (
                                        <StyledTableCell
                                            key={column.name}
                                            component="th"
                                            align={column.align}
                                            scope="row"
                                        >
                                            {!column.type && row[column.name]}
                                            {!!column.type && column.type === 'date' && formatTimeToLocal(row[column.name], locale)}
                                            {!!column.type && column.type === 'currency' && formatCurrency(row[column.name], locale)}
                                            {!!column.type && column.type === 'list' && row[column.name].map((item, idx) => (<div key={idx}>{item}</div>))}
                                        </StyledTableCell>
                                    ))}
                                    {(editable || deletable) &&
                                        <StyledTableCell
                                            component="th"
                                            align='right'
                                            scope="row"
                                        >
                                            <div className="flex justify-end gap-3">
                                                {editable && path && <UpdateButton 
                                                        link={`${path}/${row.id}/edit`}
                                                        disabled={!row.editable}
                                                    />}
                                                {deletable && deleteAction &&
                                                    <button
                                                        id={`delete@${row.id}`}
                                                        className={clsx("rounded-md border p-2",
                                                            {"hover:bg-gray-100": !!row.editable}
                                                        )}
                                                        onClick={handleMenuOpen}
                                                        disabled={!row.editable}
                                                    >
                                                        <span className="sr-only">Delete</span>
                                                        <DeleteIcon 
                                                            className={clsx("w-5",
                                                                {"text-gray-200" : !row.editable},
                                                                {"text-inherit" : !!row.editable}
                                                            )} 
                                                        />
                                                    </button>
                                                }
                                            </div>
                                        </StyledTableCell>
                                    }
                                </StyledTableRow>
                            )
                        })}
                        {rows.length === 0 &&
                            <StyledTableRow>
                                <StyledTableCell
                                    colSpan={editable ? columns.length + 1 : columns.length}
                                    align="center"
                                >
                                    No Data
                                </StyledTableCell>
                            </StyledTableRow>
                        }
                    </TableBody>
                </Table>
            </TableContainer>
            <div className="flex justify-center">
                <Pagination
                    count={totalPages}
                    shape="rounded"
                    page={currentPage}
                    onChange={(event: React.ChangeEvent, page: number) => goSelectedPage(page)}
                />
            </div>
            {renderMenu}
        </div>
    );
}