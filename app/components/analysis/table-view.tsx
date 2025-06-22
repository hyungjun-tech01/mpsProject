'use client';

import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '../pagination';
import clsx from 'clsx';
import { FolderOutlined, PrintOutlined, PersonOutlined } from '@mui/icons-material';

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


export type IAnalysisPrint = {
    id: string;
    name: string;
    C: number;
    S: number;
    P: number;
    F: number;
};

export type IAnalysisPrivacy = {
    send_time: string;
    user_name: string;
    external_user_name: string;
    document_name: string;
    detected_items: string;
    status: string;
    //   action: string;
}

// export type IAnalysisColumnNames = keyof IAnalysisPrint | keyof IAnalysisPrivacy;

export type IAnalysisPrintColumn = {
    name: keyof IAnalysisPrint;
    title: string | React.JSX.Element;
    type?: string | null;
    width?: string | null | undefined;
    values?: object;
    align?: 'right' | 'center' | 'left' | 'justify' | 'inherit';
}

export type IAnalysisPrivacyColumn = {
    name: keyof IAnalysisPrivacy;
    title: string | React.JSX.Element;
    type?: string | null;
    width?: string | null | undefined;
    values?: object;
    align?: 'right' | 'center' | 'left' | 'justify' | 'inherit';
}

export type IAnalysisTable = {
    dept?: IAnalysisPrint[],
    user?: IAnalysisPrint[],
    device?: IAnalysisPrint[],
    privacy?: IAnalysisPrivacy[]
};

interface ITable {
    defaultSection: "dept" | "user" | "device" | "privacy";
    columns: { dept?: IAnalysisPrintColumn[], user?: IAnalysisPrintColumn[], device?: IAnalysisPrintColumn[], privacy?: IAnalysisPrivacyColumn[] };
    rows: IAnalysisTable;
    itemsPerPage: number;
    currentPage: number;
    translated: Record<string, string>;
    title?: string;
}


export default function ViewTable({
    defaultSection,
    columns,
    rows,
    itemsPerPage,
    currentPage,
    translated,
    title
}: ITable) {
    const [selectedCategory, setSelectedCategory] = useState<"dept" | "user" | "device" | "privacy">(defaultSection);

    // Tabs ----------------------------------------------------------------------
    const subTitles: { category: "dept" | "user" | "device", title: string, icon: React.ElementType }[] | null
        = defaultSection !== 'privacy' ? [
            { category: 'dept', title: translated.dept, icon: FolderOutlined },
            { category: 'user', title: translated.user, icon: PersonOutlined },
            { category: 'device', title: translated.device, icon: PrintOutlined },
        ] : null;

    const selectedColumns = columns[selectedCategory];
    const selectedRows = rows[selectedCategory];
    const totalPages = !!selectedRows ? Math.ceil(selectedRows.length / itemsPerPage) : 1;
    const minIndex = (currentPage - 1) * itemsPerPage;
    const maxIndex = Math.min(currentPage * itemsPerPage, !!selectedRows ? selectedRows.length : 0);
    const showRows = !!selectedRows ? selectedRows.slice(minIndex, maxIndex) : [];

    // console.log('Table View / input data :', rows);
    // console.log('Table View / rows :', rows[selectedCategory]);
    // console.log('Table View / total pages :', totalPages);
    // console.log('Table View / min index :', minIndex);
    // console.log('Table View / max index :', maxIndex);
    // console.log('Table View / show rows :', showRows);

    return (
        <div className='py-4'>
            {!!subTitles &&
                <div className='flex justify-start'>
                    <div className='flex bg-gray-200 px-2 py-1 rounded'>
                        {subTitles.map(sub =>
                            <div key={sub.category}
                                onClick={() => setSelectedCategory(sub.category)}
                                className={clsx("h-8 py-2 px-4 font-sm align-middle text-sm hover:cursor-pointer flex gap-2 items-center", {
                                    "bg-white rounded": sub.category === selectedCategory,
                                    "bg-gray-200": sub.category !== selectedCategory,
                                })}
                            >
                                < sub.icon />
                                {sub.title}
                            </div>
                        )}
                    </div>
                </div>
            }
            {!!title && <div className=''>{title}</div>}
            {!!selectedColumns &&
                <div className="mt-4 flow-root">
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: "700px" }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    {selectedColumns.map((column, idx) => (
                                        <StyledTableCell key={idx} align={column.align} width={column.width ?? 100}>
                                            {column.title}
                                        </StyledTableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {showRows.length > 0 ? showRows.map((row, idx) => {
                                    return (
                                        <StyledTableRow key={idx}>
                                            {selectedCategory !== "privacy" ?
                                                selectedColumns.map((column, colIdx) => {
                                                    return (
                                                        <StyledTableCell
                                                            key={colIdx}
                                                            component="th"
                                                            align={column.align}
                                                            scope="row"
                                                        >
                                                            {(row as IAnalysisPrint)[column.name as keyof IAnalysisPrint]}
                                                        </StyledTableCell>
                                                    )
                                                })
                                                :
                                                selectedColumns.map((column, colIdx) => {
                                                    return (
                                                        <StyledTableCell
                                                            key={colIdx}
                                                            component="th"
                                                            align={column.align}
                                                            scope="row"
                                                        >
                                                            {(row as IAnalysisPrivacy)[column.name as keyof IAnalysisPrivacy]}
                                                        </StyledTableCell>
                                                    )
                                                })
                                            }
                                        </StyledTableRow>
                                    )})
                                    :
                                    <StyledTableRow>
                                        <StyledTableCell
                                            colSpan={selectedColumns.length}
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
                </div>
            }
        </div>
    );
}
