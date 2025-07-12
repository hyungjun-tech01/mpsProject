'use client';

import { useActionState } from 'react';
import { DeviceState } from './actions';
import Link from 'next/link';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import { IButtonInfo, ISection, IEditItem, EditItem } from '../edit-items';
import {useState, useEffect} from 'react';


export default function Form({
    items,  buttons, sessionUserName, action
} : {
    items: ISection[]; 
    buttons?: IButtonInfo;
    sessionUserName:string;
    action: (prevState: void |DeviceState, formData: FormData) => Promise<DeviceState | void>;
}){
    const initialState: DeviceState = { message: null, errors: {} };
    const [state, formAction] = useActionState(action, initialState);

    
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
            <form action={formAction}>
            <input type="hidden" name="ipAddress" value={ipAddress}/>
            <input type="hidden" name="updatedBy" value={sessionUserName}/>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
            <div key={1} className={clsx('w-full p-2 flex flex-col md:flex-row',
              { 'border-b': 1 !== items.length - 1 }
            )}>
                <div  className='w-full md:w-1/3 pb-4 md:pr-6'>
                    <div className='mb-5 text-xl font-semibold'>{items[0].title}</div>
                    <div className='text-sm'>{String(items[0].description) ?? ""}</div>
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
                                error={ (!!state?.errors && !!state?.errors[item.name as keyof DeviceState['errors']]) 
                                    ? state?.errors[item.name as keyof DeviceState['errors']]
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
                            error={ (!!state?.errors && !!state?.errors[item.name as keyof DeviceState['errors']]) 
                                ? state?.errors[item.name as keyof DeviceState['errors']]
                                : null
                            }
                            />
                        )}
                        </div>                                     
                    </div>  
                    { !!buttons &&
                        <div className="mt-6 flex justify-end gap-4">
                        { !!buttons.cancel &&
                            <Link
                            href={buttons.cancel.link}
                            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                            >
                            {buttons.cancel.title}
                            </Link>
                        }
                        { !!buttons.go &&
                            <Button
                            type="submit"
                            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                            >
                            {buttons.go.title}
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