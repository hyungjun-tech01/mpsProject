'use client';

import { useActionState, useState } from 'react';
import {  State } from './actions';
import Link from 'next/link';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import { IButtonInfo, ISection, IEditItem, EditItem , IOption} from '../edit-items';
import Select, {SingleValue} from 'react-select';


export default function FormFax(
    {id, items,  optionsUser,optionsGroup, buttons, action} : 
    {
        id?: string;  
      items: ISection[]; 
      optionsUser: IOption[];
      optionsGroup: IOption[];
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


    const [faxData, setFaxData] = useState<Record<string, any>>({});

    const handleChange = (name: string, newValue: SingleValue<{ value: string; label: string }>) => {
        setFaxData(prev => ({
            ...prev,
            [name]: newValue ? newValue.value : ""  // 📌 값이 있으면 저장, 없으면 빈 값
        }));
    }; 
    const handleInputChange = (name: string, value: string) => {
        setFaxData(prev => ({
            ...prev,
            [name]: value
        }));
    };    

    const handleSaveFaxLine = ()=>{
        console.log( faxData);
        
    }
    const handleDeleteFaxLine = ()=> {

    }
    
    const handleAddFaxLine = () => {
        console.log('handleAddFaxLine');

        const hasEmptyHiddenValue = faxItems.some(
            (item) => item.type === 'hidden' && (typeof item.defaultValue !== 'string' || item.defaultValue.trim() === '')
        );
    
        if (hasEmptyHiddenValue) {
            alert('회선 추가한 내용을 먼저 저장하세요');
            return;
        }

        const index = faxItems.length/6 + 1; // 현재 배열 길이를 인덱스로 사용


        if(index >= 4) {
            alert('팩스 회선은 3개까지 추가됩니다.');
            return;
        }
        const newFaxLine = [
            { name: `fax_line_id_${index}`, title: `팩스라인 아이디 ${index}} ${index+1}` , type: 'hidden', defaultValue: '', placeholder: 'fax.fax_line_id' },
            { name: `fax_line_name_${index}`, title: `팩스라인 번호 ${index}`, type: 'input', defaultValue: '', placeholder: '팩스라인 번호' },
            { 
                name: `fax_line_user_id_${index}`, title: '회선 사용자', type: 'react-select', defaultValue: { value: '', label: '-1 없음' }, placeholder: '회선 사용자',
                options: optionsUser
            },
            { 
                name: `fax_line_shared_group_id_${index}`, title: '회선 공유그룹', type: 'react-select', defaultValue: { value: '', label: '-1 없음' }, placeholder: '회선 공유그룹',
                options: optionsGroup
            },
            { name: `button_${index}`, title: '저장' , type: 'button', defaultValue: '', placeholder: '' },
            { name: `space_line_${index}`, title: '회선 공유그룹', type: 'input', defaultValue: '', placeholder: '회선 공유그룹' }
        ];
        setFaxItems([...faxItems, ...newFaxLine]); // 기존 배열에 추가

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
                            faxItems.map((item: IEditItem) => {
                                if (item.name.startsWith("space_line")) {
                                    return <br key={item.name} />;
                                }
                            
                                switch (item.type) {
                                    case "react-select":
                                        return (
                                            <div key={item.name} className="mb-4">
                                                <label htmlFor={item.name} className="mb-2 block text-sm font-semibold">
                                                    {item.title}
                                                </label>
                                                <Select
                                                    id={item.name}
                                                    key={item.name}
                                                    name={item.name}
                                                    defaultValue={item.defaultValue}
                                                    options={item.options}
                                                    onChange= {(selected) => handleChange(item.name, selected)} 
                                                    aria-describedby={`1-error`}
                                                />
                                            </div>
                                        );
                                    case "button":
                                        return(
                                            <div key= {item.name} className="mt-6 flex justify-end gap-4">
                                            <Button
                                                name={item.name}
                                                type="button"
                                                onClick={handleDeleteFaxLine}
                                                className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                                            >
                                            삭제
                                            </Button>
                                            <Button
                                                name={item.name}
                                                type="button"
                                                onClick={handleSaveFaxLine}
                                                className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                                            >
                                            저장
                                            </Button>                                            
                                            </div>
                                        );
                                    case "input":
                                        return (
                                            <div key={item.name} className="mb-4">
                                                <label htmlFor={item.name} className="mb-2 block text-sm font-semibold">
                                                {item.title}
                                                </label>
                                                <div className="relative mt-2 rounded-md">
                                                <div className="relative">
                                                    <input
                                                    id={item.name}
                                                    name={item.name}
                                                    type="text"
                                                    defaultValue={item.defaultValue}
                                                    placeholder={item.placeholder}
                                                    onChange={(e) => handleInputChange(item.name, e.target.value)}
                                                    className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                                    />
                                                </div>
                                                </div>
                                            </div>
                                        );
                                    case "hidden":
                                        return (
                                            <div key={item.name} className="mb-4">
                                                <div className="relative mt-2 rounded-md">
                                                    <div className="relative">
                                                    <input
                                                        id={item.name}
                                                        name={item.name}
                                                        type="hidden"
                                                        defaultValue={item.defaultValue}
                                                        placeholder={item.placeholder}
                                                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                                    />
                                                    </div>
                                                </div>
                                            </div>                                            
                                        );
                                }
                            })
                            
                        ) : (
                            <p className="text-gray-500 text-sm"></p>
                        )}
                    </div>                
                </div>
            </div>
            </div>
            </form>
        </div>
    );
}