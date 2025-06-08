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
import { IColumnData } from '@/app/lib/definitions';
import { formatCurrency, formatTimeToLocal } from '@/app/lib/utils';
import Link from 'next/link';


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

interface ITable<DataType> {
    columns: IColumnData[];
    rows: DataType[];
    locale?: 'ko' | 'en';
}

export default function CustomizedTable<DataType>({
    columns,
    rows,
    locale = 'ko',
}: ITable<DataType>) {

    let columnLength = columns.length;

    return (
        <div style={{ marginTop: '1.5rem', display: 'flow-root' }}>
            <TableContainer component={Paper}>
                <Table sx={{minWidth: "700px"}} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, idx) => (
                                <StyledTableCell key={idx} align={column.align} width={column.width ?? 100}>
                                    {column.title}
                                </StyledTableCell>
                            ))}
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
                                                {!column.type && row[column.name]}
                                                {!!column.type && column.type === 'date' && formatTimeToLocal(row[column.name], locale)}
                                                {!!column.type && column.type === 'link' && 
                                                    <Link href={row.link} className='flex justify-center text-lime-700'>
                                                        <button className='rounded-md bg-lime-700 text-white text-sm px-2 py-1'>{locale === "ko" ? "보기" : "View"}</button>
                                                    </Link>
                                                }
                                            </StyledTableCell>
                                        )
                                    })}
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
        </div>
    );
}