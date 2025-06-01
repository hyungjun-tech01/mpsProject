'use client';

import {useActionState, useEffect, useState} from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import { IColumnData } from '@/app/lib/definitions';
import { formatCurrency, formatTimeToLocal } from '@/app/lib/utils';
import { DeleteButtton } from '../buttons';


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

interface ISettingTable<DataType> {
    columns: IColumnData[];
    rows: DataType[];
    currentPage: number;
    totalPages: number;
    locale?: 'ko' | 'en';
    action: (prevState:object, formData:FormData) => void,
    deleteAction?: (id: string) => void;
    deletable?: boolean;
}

export default function CustomizedTable<DataType>({
    columns,
    rows,
    totalPages,
    locale = 'ko',
    action,
    deleteAction,
    deletable = true,
}: ISettingTable<DataType>) {
    const initialState: object = { message: null, errors: {} };
    const [data, setData] = useState<object[]>([]);
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [seletedIds, setSelectedIds] = useState<string>("");
    const [chosenID, setChosenID] = useState<string>('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [state, formAction] = useActionState(action, initialState);

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
            transfer_selected_users: '선택 사용자 전송',
        },
        en: {
            confirm_delete: 'Are you sure?',
            cancel: 'Cancel',
            delete: 'Delete',
            transfer_selected_users: 'Transfer Selected Users',
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
                    <DeleteButtton id={chosenID} title={translate[locale].delete} action={deleteAction} />
                </div>
            </div>
        </Menu>
    );

    const handleSelectAllClick = (event) => {
        if(event.target.checked) {
            let selectedIds:string = "";
            const updatedData = data.map(row =>{
                selectedIds += row.id;
                return {
                    ...row,
                    checked : true
                };
            })
            setData(updatedData);
            setIsSelected(true);
            setSelectedIds(selectedIds);
        } else {
            setData(data.map(row => ({
                ...row,
                checked: false
            })))
            setIsSelected(false);
            setSelectedIds("");
        }
    };

    const handleSelectOneClick = (event) => {
        const selected = event.target.id;
        if(event.target.checked) {
            setData(prevState => {
                const foundIdx = prevState.findIndex(row => row.id === selected);
                if(foundIdx !== -1) {
                    const modified = {
                        ...prevState[foundIdx],
                        checked: true
                    };
                    const updatedData = [
                        ...prevState.slice(0, foundIdx),
                        modified,
                        ...prevState.slice(foundIdx + 1, )
                    ];
                    setData(updatedData);
                }
            });
            setIsSelected(true);
            setSelectedIds(prevState => prevState === "" ? 
                selected : prevState + ";" + selected
            );
        } else {
            let isAnySelected : boolean = false;
            let foundIdx = -1;
            let updated = "";
            setData(prevState => {
                for(let i = 0; i< prevState.length; i++) {
                    if(prevState[i].id === selected) {
                        foundIdx = i;
                    } else {
                        updated += prevState[i].id;
                    }
                    isAnySelected |= prevState[i].checked;
                };
                
                if(foundIdx !== -1) {
                    const modified = {
                        ...prevState[foundIdx],
                        checked: true
                    };
                    const updatedData = [
                        ...prevState.slice(0, foundIdx),
                        modified,
                        ...prevState.slice(foundIdx + 1, )
                    ];
                    setData(updatedData);
                };
            });
            setIsSelected(isAnySelected);
            setSelectedIds(updated);
        }
    };

    let columnLength = columns.length + 2;

    useEffect(()=>{
        console.log('Setting Table - useEffect');
        setData(rows.map(row => {
            return ({
                checked: false,
                ...row
            })
        }));
    }, [rows])

    return (
        <div className="mt-3">
            {isSelected && 
                <div className="mt-2 mb-4 flex justify-end">
                    <form action={formAction}>
                        <input id="selected_ids" type="hidden" name="selected_ids" value={seletedIds} />
                        <button type="submit"
                        className="flex h-10 items-center border border-gray-500 border-dashed rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                    >
                        {translate[locale].transfer_selected_users}
                    </button>
                    </form>
                </div>
            }
            <TableContainer component={Paper}>
                <Table className="min-w-[700px]" aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell align='right'>
                                <input type="checkbox" onChange={handleSelectAllClick} />
                            </StyledTableCell>
                            {columns.map((column, idx) => (
                                <StyledTableCell key={idx} align={column.align} >
                                    {column.title}
                                </StyledTableCell>
                            ))}
                            {(deletable) && <StyledTableCell align='right'>{' '}</StyledTableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(!!data && data.length > 0) ? data.map((row, idx) => {
                            return (
                                <StyledTableRow key={idx}>
                                    <StyledTableCell
                                        component="th"
                                        align='center'
                                        scope="row"
                                    >
                                        <input type="checkbox" id={row.id} name={row.id} defaultChecked={row.checked} onChange={handleSelectOneClick} />
                                    </StyledTableCell>
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
                                                {!!column.type && column.type === 'currency' && formatCurrency(row[column.name], locale)}
                                                {!!column.type && column.type === 'list' && row[column.name].map((item, idx) => (<div key={idx}>{item}</div>))}
                                            </StyledTableCell>
                                        )
                                    })}
                                    {deletable &&
                                        <StyledTableCell
                                            component="th"
                                            align='right'
                                            scope="row"
                                        >
                                            <div className="flex justify-center gap-3">
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