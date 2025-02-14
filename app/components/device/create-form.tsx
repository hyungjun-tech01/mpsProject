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
                    <div className="mb-4">
                        <label htmlFor="title_device_type" className="mb-2 block text-sm font-medium">
                           Device Type
                        </label>
                        <select
                            id="device_type"
                            name="device_type"
                            className="peer block w-1/2 cursor-pointer rounded-md border border-gray-200 py-2 pl-2 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue=""
                        >
                            <option value="" className="text-left" disabled>
                                Choose device type
                            </option>
                            <option value="OpenAPI" className="text-left">
                                OpenAPI
                            </option>
                            <option value="Workpath SDK" className="text-left">
                                Workpath SDK
                            </option>
                        </select>
                        {state.errors?.device_type && (
                            <p className="text-red-500 text-sm">{state.errors.device_type[0]}</p>
                        )}
                    </div>

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

                    <div className="mb-4">
                        <label htmlFor="title_device_administrator_password" className="mb-2 block text-sm font-medium">
                            Device's Administrator Password
                        </label>
                        <input
                            id="device_administrator_password"
                            name="device_administrator_password"
                            type="password"
                            defaultValue=""
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                         {state.errors?.device_administrator_password && (
                            <p className="text-red-500 text-sm">{state.errors.device_administrator_password[0]}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_ext_device_function" className="mb-2 block text-sm font-medium">
                            장치 기능 
                        </label>
                        <div className="mb-4">
                            <input
                                id="ext_device_function_printer"
                                name="ext_device_function_printer"
                                type="checkbox"
                                value="Y"
                                checked={printerChecked}
                                onChange={handlePrinterChange}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2 "
                            />
                            <label htmlFor="ext_device_function_printer" className="ml-2 text-sm font-medium">
                                Track & Control Copying
                            </label>
                        </div>
                        <div className="mb-4">
                            <input
                                id="ext_device_function_scan"
                                name="ext_device_function_scan"
                                type="checkbox"
                                value="Y"  // 체크 시 "Y" 전송
                                checked={scanChecked}
                                onChange={handleScanChange}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                            />
                            <label htmlFor="ext_device_function_scan" className="ml-2 text-sm font-medium">
                                Track & Control Scanning
                            </label>
                        </div>
                        <div className="mb-4">
                            <input
                                id="ext_device_function_fax"
                                name="ext_device_function_fax"
                                type="checkbox"
                                value="Y"
                                checked={faxChecked}
                                onChange={handleFaxChange}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                            />
                            <label htmlFor="ext_ext_device_function_fax" className="ml-2 text-sm font-medium">
                                Track & Control Fax
                            </label>
                        </div>          
                        <div className="mb-4">
                            <input
                                id="enable_print_release"
                                name="enable_print_release"
                                type="checkbox"
                                value="Y"
                                checked={enablePrintChecked}
                                onChange={handleEnablePrintChange}
                                className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                            />
                            <label htmlFor="ext_ext_device_function_fax" className="ml-2 text-sm font-medium">
                                Enable Print 
                            </label>
                        </div>                                           
                    </div>  
                    <div className="mb-4">
                        <label htmlFor="title_printer_device_group" className="mb-2 block text-sm font-medium">
                            Printer/Device Group
                        </label>
                        <input
                            id="printer_device_group"
                            name="printer_device_group"
                            type="text"
                            defaultValue=""
                            className="h-8 w-1/2 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                        />
                        {state.errors?.printer_device_group && (
                            <p className="text-red-500 text-sm">{state.errors.printer_device_group[0]}</p>
                        )}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="title_printer_device_group" className="mb-2 block text-sm font-semibold">
                            Printer/Device Group
                        </label>
                        <div className="relative">
                            <select
                                id='printer_device_group'
                                name='printer_device_group'
                                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                defaultValue="N"
                                aria-describedby="disablePrinting-error"
                            >
                                <option value="N">
                                    N
                                </option>
                            </select>
                        </div>
                        <div id="disablePrinting-error" aria-live="polite" aria-atomic="true">
                            {state?.errors?.disablePrinting &&
                                state.errors.disablePrinting.map((error: string) => (
                                    <p className="mt-2 text-sm text-red-500" key={error}>
                                        {error}
                                    </p>
                            ))}
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