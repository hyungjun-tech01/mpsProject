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
import { IColumnData } from '@/app/lib/definitions';
import { formatCurrency, formatTimeToLocal } from '../lib/utils';
import { UpdateButton, DeleteButtton } from './buttons';


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
    category?: string;
    locale?: string;
    deleteAction?: (id: string) => void;
    editable?: boolean;
    checkable?: boolean;
}

export default function CustomizedTable<DataType>({
    columns,
    rows,
    currentPage,
    totalPages,
    category,
    locale,
    deleteAction,
    editable = true,
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

    return (
        <div style={{ marginTop: '1.5rem', display: 'flow-root' }}>
            <TableContainer component={Paper}>
                <Table className="min-w-[700px]" aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            { checkable && <StyledTableCell align='right'>{' '}</StyledTableCell>}
                            {columns.map((column, idx) => (
                                <StyledTableCell key={idx} align={column.align} >
                                    {column.title}
                                </StyledTableCell>
                            ))}
                            { editable && <StyledTableCell align='right'>{' '}</StyledTableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length > 0 && rows.map((row, idx) => {
                            return (
                                <StyledTableRow key={idx}>
                                    { checkable && 
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
                                            { !column.type && row[column.name]}
                                            { !!column.type && column.type === 'date' && formatTimeToLocal(row[column.name], locale)}
                                            { !!column.type && column.type === 'currency' && formatCurrency(row[column.name], locale)}
                                            { !!column.type && column.type === 'list' && row[column.name].map((item, idx)=> (<div key={idx}>{item}</div>))}
                                        </StyledTableCell>
                                    ))}
                                    { editable && 
                                        <StyledTableCell
                                            component="th"
                                            align='right'
                                            scope="row"
                                        >
                                            <div className="flex justify-end gap-3">
                                                {category && <UpdateButton link={`${category}/${row.id}/edit`} />}
                                                {deleteAction && <DeleteButtton id={row.id} action={deleteAction} />}
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
        </div>
    );
}