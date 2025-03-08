'use client';

import { useActionState, useState } from 'react';
import {  State } from './actions';
import Link from 'next/link';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import { IButtonInfo, ISection, IEditItem, EditItem } from '../edit-items';


export default function FormFax(
    {id, items,  buttons, action} : 
    {
        id?: string;  
      items: ISection[]; 
      buttons?: IButtonInfo;
      action: (prevState: State, formData: FormData) => Promise<void>;
    }
){
    const initialState: State = { message: null, errors: null };
    const [printerChecked, setPrinterChecked] = useState(false);
    const [scanChecked, setScanChecked] = useState(false);
    const [faxChecked, setFaxChecked] = useState(false);
    const [enablePrintChecked, setEnablePrintChecked] = useState(false);

    const [faxItems, setFaxItems] = useState(items[0]?.items || []);

    const handleAddFaxLine = () => {
        console.log('handleAddFaxLine');
        const index = faxItems.length/4 + 1; // 현재 배열 길이를 인덱스로 사용
        if(index >= 4) {
            alert('팩스 회선은 3개까지 추가됩니다.');
            return;
        }
        const newFaxLine = [
            { name: `fax_line_name_${index}`, title: `팩스라인 번호 ${index}`, type: 'input', defaultValue: '', placeholder: '팩스라인 번호' },
            { name: `fax_line_user_id_${index}`, title: '회선 사용자', type: 'input', defaultValue: '', placeholder: '회선 사용자'},
            { name: `fax_line_shared_group_id_${index}`, title: '회선 공유그룹', type: 'input', defaultValue: '', placeholder: '회선 공유그룹' },
            { name: `space_line_${index}`, title: '회선 공유그룹', type: 'input', defaultValue: '', placeholder: '회선 공유그룹' }
        ];
        setFaxItems([...faxItems, ...newFaxLine]); // 기존 배열에 추가

        console.log(faxItems);
    };

    // const updatedAction = !!id ? action.bind(null, id) : action;
    const updatedAction =    action;
    const [state, formAction] = useActionState(updatedAction, initialState);

    //const [state, formAction] = useActionState(increment, 0);
    

    // 체크박스 상태 변경 핸들러
    const handlePrinterChange = (e:any) => {
        setPrinterChecked(e.target.checked);
    };

    const handleScanChange = (e:any) => {
        setScanChecked(e.target.checked);
    };

    const handleFaxChange = (e:any) => {
            setFaxChecked(e.target.checked);
    };

    const handleEnablePrintChange = (e:any) => {
        setEnablePrintChecked(e.target.checked);
    };

    console.log('create form');
    return (
        <div>
            <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
            <div key={1} className={clsx('w-full p-2 flex flex-col md:flex-row',
              { 'border-b': 1 !== items.length - 1 }
            )}>
                <div  className='w-full md:w-1/3 pb-4 md:pr-6'>
                    <div className='mb-5 text-xl font-semibold'>{items[0].title}</div>
                    <div className='text-sm'>{items[0].description}</div>
                </div>
                <div className="w-2/3 pl-6">
                    <div className='w-full md:w-2/3'>
                        {!!buttons && <div>{ !!buttons.add &&
                                <Button
                                type="button"
                                onClick={handleAddFaxLine}
                                className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                                >
                                {buttons.add.title}
                                </Button>
                            } </div>
                        }
                        {faxItems.length > 0 ? (
                            faxItems.map((item: IEditItem) =>
                                item.name.startsWith('space_line') ? <br key={item.name} /> : (
                                    <EditItem
                                        key={item.name}
                                        name={item.name}
                                        title={item.title}
                                        type={item.type}
                                        defaultValue={item.defaultValue}
                                        placeholder={item.placeholder}
                                        options={item.options}
                                        locale={item.locale}
                                        chartData={item.chartData}
                                        other={item.other}
                                        error={ (!!state?.errors && !!state?.errors[item.name]) 
                                            ? state?.errors[item.name]
                                            : null
                                        }
                                    />
                                )
                            )
                        ) : (
                            <p className="text-gray-500 text-sm"></p>
                        )}
                    </div>
                    { !!buttons &&
                        <div className="mt-6 flex justify-end gap-4">
                        { !!buttons.save &&
                            <Button
                            type="submit"
                            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                            >
                            {buttons.save.title}
                            </Button>
                        }
                        </div>
                    }                    
                </div>
            </div>
            </div>
            </form>
        </div>
    );
}