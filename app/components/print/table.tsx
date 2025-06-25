'use client';

import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '../pagination';
import { IColumnData } from '@/app/lib/definitions';
import Image from 'next/image';
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

interface ITable {
    columns: IColumnData[];
    rows: Record<string, string | number | string[]>[];
    currentPage: number;
    totalPages: number;
    path?: string;
    sesseionUserName?: string;
    t: Record<string, string>;
    checkable?: boolean;
    deleteAction: (id: string[], param: string) => void;
    printAction: (id: string[]) => void;
}

export default function CustomizedTable({
    columns,
    rows,
    totalPages,
    path,
    sesseionUserName,
    t,
    checkable = false,
    deleteAction,
    printAction,
}: ITable) {
    const [ selectedIds, setSelectedIds ] = useState<string[]>([]);

    const handleCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
        if(event.target.checked) {
            const updateSelectedIds = [
                ...selectedIds,
                event.target.id
            ];
            setSelectedIds(updateSelectedIds);
        } else {
            const foundIdx = selectedIds.findIndex(id => id === event.target.id);
            if(foundIdx !== -1) {
                const updateSelectedIds = [
                    ...selectedIds.slice(0, foundIdx),
                    ...selectedIds.slice(foundIdx + 1,),
                ];
                setSelectedIds(updateSelectedIds);
            }
        }
    }
    const handlePrintAll = () => {
        const allIds = rows.map(row => String(row.id));
        printAction(allIds);
        setSelectedIds([]);
    }
    const handleDeleteAll = () => {
        const allIds = rows.map(row => String(row.id));
        const merged = `${sesseionUserName ?? 'unknown'},${ipAddress ?? 'unknown'}`;
        
        deleteAction(allIds, merged);
        setSelectedIds([]);
    }
    const handlePrintChecked = () => {
        printAction(selectedIds);
        setSelectedIds([]);
    }
    const handleDeleteChecked = () => {
        const merged = `${sesseionUserName ?? 'unknown'},${ipAddress ?? 'unknown'}`;
        deleteAction(selectedIds, merged);
        setSelectedIds([]);
    }

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

    return (
        <div>
            <div className="flex justify-start mt-6">
                <div className="mr-12">
                    <div className="flex gap-2">
                        <button className="text-[16px] rounded-md bg-lime-700 text-white py-2 px-3"
                            onClick={handlePrintAll}
                        >
                            {t.printAll}
                        </button>
                        <button className="text-[16px] rounded-md border-2 border-gray-200 text-gray-500 py-2 px-3"
                            onClick={handleDeleteAll}
                        >
                            {t.deleteAll}
                        </button>
                    </div>
                </div>
                <div>
                    <div className="flex gap-2">
                        <button className="text-[16px] rounded-md border-2 border-gray-200 text-gray-500 py-2 px-3"
                            onClick={handlePrintChecked}
                        >
                            {t.printChecked}
                        </button>
                        <button className="text-[16px] rounded-md border-2 border-gray-200 text-gray-500 py-2 px-3"
                            onClick={handleDeleteChecked}
                        >
                            {t.deleteChecked}
                        </button>
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flow-root' }}>
                <TableContainer component={Paper}>
                    <Table sx={{minWidth: "700px"}} aria-label="customized table">
                        <TableHead>
                            <TableRow>
                                {checkable && <StyledTableCell align='right'>{' '}</StyledTableCell>}
                                {columns.map((column, idx) => (
                                    <StyledTableCell key={idx} align={column.align} >
                                        {column.title}
                                    </StyledTableCell>
                                ))}
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
                                                <input 
                                                    type="checkbox"
                                                    id={String(row.id)}
                                                    name={String(row.id)}
                                                    defaultChecked={selectedIds.findIndex(id => id === String(row.id)) !== -1}
                                                    onChange={handleCheck}
                                                />
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
                                                    {!column.type && row[column.name]}
                                                    {!!column.type && column.type === 'list' && (row[column.name] as string[]).map((item, idx) => (<div key={idx}>{item}</div>))}
                                                    {!!column.type && column.type === 'icon' &&
                                                        <div className='flex justify-center'><Image src={`/${row[column.name]}`} alt="icon" width={24} height={24} className="w-6 h-6" /></div>
                                                    }
                                                    {/* {!!column.type && column.type === 'enum_icon' &&
                                                        <div className='flex justify-center'>{column.values[row[column.name]]}</div>
                                                    } */}
                                                    {!!column.type && column.type === 'edit' &&
                                                        <Link href={`${path}/${row.id}/edit`} className='flex justify-center text-lime-700'>{row[column.name]}</Link>
                                                    }
                                                </StyledTableCell>
                                            )
                                        })}
                                    </StyledTableRow>
                            )})
                            :
                                <StyledTableRow>
                                    <StyledTableCell
                                        colSpan={checkable ? columns.length + 1 : columns.length}
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
        </div>
    );
}