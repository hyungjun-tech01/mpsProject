'use client';

import { useActionState, useState } from 'react';
import { createDevice, State } from './actions';
import Link from 'next/link';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import { IButtonInfo, ISection, IEditItem, EditItem } from '../edit-items';


export default function Form(
    {items}:{items: ISection[];}
){
    const initialState: State = { message: null, errors: null };
    const [printerChecked, setPrinterChecked] = useState(false);
    const [scanChecked, setScanChecked] = useState(false);
    const [faxChecked, setFaxChecked] = useState(false);
    const [enablePrintChecked, setEnablePrintChecked] = useState(false);

    const [state, formAction] = useActionState(createDevice, initialState);

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
                        { items[0].items.map((item: IEditItem) =>
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
                        )}
                    </div>

                    <div className="w-full md:w-2/3">
                        <label htmlFor="title_ext_device_function" className="mb-2 block text-sm font-semibold">
                           {items[1].title}
                        </label>
                        <div className='w-full md:w-2/3'>
                        { items[1].items.map((item: IEditItem) =>
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
                        )}
                        </div>                                     
                    </div>  
                    <div className="mt-4 flex justify-start gap-4">
                    <Link
                        href="/device"
                        className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-sm font-medium text-white transition-colors hover:bg-lime-500"
                        >
                    Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex h-10 items-center rounded-lg bg-lime-600 px-4 text-sm font-medium text-white transition-colors hover:bg-lime-500"
                        >
                    Create Device
                    </button>
                    </div>
                </div>
            </div>
            </div>
            </form>
        </div>
    );
}