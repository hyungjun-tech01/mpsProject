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
import Pagination from '@mui/material/Pagination';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { IColumnData } from '@/app/lib/definitions';
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
    deleteAction?: (id: string) => void;
    editable?: boolean;
}

export default function CustomizedTable<DataType>({
    columns,
    rows,
    currentPage,
    totalPages,
    category,
    deleteAction,
    editable = true,
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
                            {columns.map((column, idx) => (
                                <StyledTableCell key={idx} align={column.align} >
                                    {column.title}
                                </StyledTableCell>
                            ))}
                            { editable && <StyledTableCell align='right'>{' '}</StyledTableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, idx) => {
                            return (
                                <StyledTableRow key={idx}>
                                    {columns.map((column) => (
                                        <StyledTableCell
                                            key={column.name}
                                            component="th"
                                            align={column.align}
                                            scope="row"
                                        >
                                            {row[column.name]}
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
                    </TableBody>
                </Table>
            </TableContainer>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
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