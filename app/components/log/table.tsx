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
import Pagination from '../pagination';
import { Menu } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IColumnData } from '@/app/lib/definitions';
import { formatCurrency, formatTimeToLocal, formatTimeSimple } from '../../lib/utils';
import { UpdateButton, DeleteButtton } from '../buttons';
import clsx from 'clsx';
import Image from 'next/image';
import AuditLogPdfViewer from './AuditLogPdfViewer';
import AuditLogTextViewer from './AuditLogTextViewer';
import { Button, Modal } from '@mui/material';

import '@react-pdf-viewer/core/lib/styles/index.css';
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
    totalPages,
    path,
    locale = 'ko',
    deleteAction,
    editable = true,
    deletable = true,
    checkable = false,
}: ITable<DataType>) {
    const [chosenID, setChosenID] = React.useState<string>('');
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = React.useState(false);
    const [pdfUrl, setPdfUrl] = React.useState<string | undefined>(undefined);
    const [auditPdfContent, setAuditPdfContent] = React.useState<Blob | null>(null);
    const [auditContent, setAuditContent] = React.useState<string | null>(null);
    const [isTextModalOpen, setIsTextModalOpen] = React.useState(false);

    const closePdfModal = React.useCallback(() => setIsPdfModalOpen(false), []);
    const closeTextModal = React.useCallback(() => setIsTextModalOpen(false), []);

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

    const replaceThumbnailSrc = (imagePath:string|null):string => {
       if (!imagePath) return '';

        const found_idx = imagePath.lastIndexOf('.');
        if(found_idx !== -1){
            //const thumbnail_src = value?.slice(0, found_idx) + '_thumbnail.png';
            const nameWithoutExtension = imagePath.substring(0, found_idx);
            const thumbnail_src = 'api/file?filename=ImageLog/'+ nameWithoutExtension + '_thumbnail.png'; 
            const replace_thumbnail_src = thumbnail_src.replace(/\\/g,'/');
            return replace_thumbnail_src;
        }else{    
            return '';
        }
    }

    const handleThumnailClick = async (imagePath:string|null) => {
        try {
            if (!imagePath) {
              throw new Error('Invalid pdf path');
            }
            const src = '/api/file?filepath=ImageLog/'+imagePath;
            const replace_src = src.replace(/\\/g,'/');
            const response = await fetch(replace_src);
            if (!response.ok) {
              throw new Error('Failed to decrypt file');
            }
            const blob = await response.blob();

            const url = URL.createObjectURL(blob);

            setAuditPdfContent(blob);
            setPdfUrl(url);
            setIsPdfModalOpen(true);
        } catch (error) {
            if (error instanceof Error) {
                alert(`Error: ${error.message}`);
                //console.error('Error decrypting file:', error);
            } else {
                alert('An unknown error occurred');
                console.error('Unknown error:', error);
            }
        }
    }

    const handleAuditLogDateClick = async (textfilename:string|null) => {
        try {
            if (!textfilename) {
                throw new Error('Invalid text file path');
            }
            const src = '/api/file?textfilename=ImageLog/'+textfilename;
            const replace_src = src.replace(/\\/g,'/');
            const response = await fetch(replace_src);
            if (!response.ok) {
                throw new Error('Failed to decrypt file');
            }
            const decryptText = await response.text();

            setAuditContent(decryptText);
            setIsTextModalOpen(true);

        } catch (error) {
            console.log('Error decrypting file:', error);
            setAuditContent(null);
            setIsTextModalOpen(false);
        } 
    }    

    return (
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
                                    {columns.map((column) => {
                                        return(
                                        <StyledTableCell
                                            key={column.name}
                                            component="th"
                                            align={column.align}
                                            scope="row"
                                        >
                                            {!column.type && row[column.name]}
                                            {!!column.type && column.type === 'date' && formatTimeToLocal(row[column.name], locale)}
                                            {!!column.type && column.type === 'date_simple' && formatTimeSimple(row[column.name])}
                                            {!!column.type && column.type === 'currency' && formatCurrency(row[column.name], locale)}
                                            {!!column.type && column.type === 'list' && row[column.name].map((item, idx) => (<div key={idx}>{item}</div>))}
                                            {!!column.type && column.type === 'file' &&
                                                <div className='hover:cursor-pointer text-lime-700'
                                                    onClick={() => handleFileClick(row[column.name])}>{row.name}</div>
                                            }
                                            {!!column.type && column.type === 'icon' &&
                                                <div className='flex justify-center'><Image  src={`/${row[column.name]}`}  alt="icon" width={24} height={24} className="w-6 h-6"/></div>
                                            }
                                            {!!column.type && column.type === 'auditLogImage' &&
                                                <div className='flex justify-center  bg-gray-200 border'>
                                                <Image 
                                                    src={`/${replaceThumbnailSrc(row[column.name])}`} 
                                                    alt="No Image"  
                                                    className="w-24 h-18"
                                                    onClick={() => handleThumnailClick(row[column.name])}
                                                    onError={(e) => e.currentTarget.src = '/fallback-image.png'} 
                                                />
                                                </div>
                                            }
                                            {!!column.type && column.type === 'auditLogDate' &&
                                                <div className='flex justify-center' onClick={()=>handleAuditLogDateClick(row.text_archive_path)}>
                                                    {formatTimeSimple(row[column.name])}
                                                </div>
                                            }
                                            {!!column.type && column.type === 'enum_icon' &&
                                                <div className='flex justify-center'>{column.values[row[column.name]]}</div>
                                            }
                                            { !!column.type && column.type === 'hidden' &&
                                                <div className='flex justify-center'>{row[column.name]}</div>
                                            }
                                            { !!column.type && column.type === 'edit' &&
                                                <Link href={`${path}/${row.id}/edit`} className='flex justify-center text-lime-700'>{row[column.name]}</Link>
                                            }
                                        </StyledTableCell>
                                    )}
                                    
                                    )}
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
            <div className="flex justify-center py-3">
                <Pagination totalPages={totalPages} />
            </div>
            {renderMenu}
            <Modal
                open={isPdfModalOpen}
                onClose={closePdfModal}
                style={{ width: '800px',
                    height: '85vh',
                    backgroundColor: '#ffffff',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '5px solid #000' }}
            >
                <div>
                    <AuditLogPdfViewer pdfUrl={pdfUrl} auditPdfContent={auditPdfContent} onClose={closePdfModal}/>
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={closePdfModal}
                            sx={{ mt: 3, mb: 2 , 
                                backgroundColor:"rgba(25,137,43,255)",
                                ":hover": { backgroundColor: "rgba(13,118,33,255)" }
                            }}
                        >
                            닫기
                        </Button>
                    </div>
                </div>
            </Modal>   

            <Modal
                open={isTextModalOpen}
                onClose={closeTextModal}
                style={{ width: '800px',
                    height: '85vh',
                    backgroundColor: '#ffffff',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '5px solid #000' }}
            >
                <div>
                    <AuditLogTextViewer Url={pdfUrl} auditContent={auditContent} onClose={closeTextModal} />
                    <div style={{ textAlign: 'right' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={closeTextModal}
                            sx={{ mt: 3, mb: 2 , 
                                backgroundColor:"rgba(25,137,43,255)",
                                ":hover": { backgroundColor: "rgba(13,118,33,255)" }
                                }}
                        >
                            닫기
                        </Button>
                    </div>
                </div>
            </Modal>         
        </div>
    );
}