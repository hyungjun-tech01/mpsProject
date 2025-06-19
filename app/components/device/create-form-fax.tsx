'use client';

import { useActionState, useState } from 'react';
import { State } from './actions';
import clsx from 'clsx';
import Button from '@mui/material/Button';
import {deleteFaxLineInfo, saveFaxLineInfo} from '@/app/components/device/actions';
import { IButtonInfo, IOption, IItem} from '../edit-items';
import Select, {SingleValue} from 'react-select';
import { useRouter } from 'next/navigation';


export default function FormFax(
    {id,title,description, items,  optionsUser,optionsGroup, buttons, action} : 
    {
        title:string;
        description:string;
        id: string;  
        items: IItem[]; 
        optionsUser: IOption[];
        optionsGroup: IOption[];
        buttons?: IButtonInfo;
        action: (prevState: State, formData: FormData) => Promise<void>;
    }
){
    const initialState: State = { message: null, errors: null };

    //const [faxItems, setFaxItems] = useState(items[0]?.items || []);

    const [faxItemOriginal, setFaxItemOriginal] = useState(items || []);

    const router = useRouter();


    const [faxData, setFaxData] = useState<Record<string, any>>({});

    // const [deletedFaxLineId, setDeletedFaxLineId] = useState<string | null>(null);

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

    const handleSaveFaxLine = async (indexToSave?: number)=>{
        if (indexToSave === undefined) return; // index가 없으면 함수 종료

        console.log('handleSaveFaxLine', indexToSave, faxData);

        // 1. 해당 index의 팩스라인 번호, 회선 사용자, 회선 공유그룹 찾기

        const faxLindId = (document.getElementById(`fax_line_id_${indexToSave}`) as HTMLInputElement)?.value;
        const faxLineNumber = (document.getElementById(`fax_line_name_${indexToSave}`) as HTMLInputElement)?.value; 
        const faxLineUser = faxData[`fax_line_user_id_${indexToSave}`] || "";
        const faxLineGroup = faxData[`fax_line_shared_group_id_${indexToSave}`] || "";

        if (!faxLineNumber || faxLineNumber.trim() === "") {
            alert("팩스라인 번호를 입력해주세요.");
            return;
        }
    
        const saveFaxLineData  = {
            fax_line_id : faxLindId,
            fax_line_name : faxLineNumber,
            fax_line_user_id : faxLineUser,
            fax_line_shared_group_id : faxLineGroup,
            printer_id : id,
        }

        if (saveFaxLineData && id !== undefined) {
            const out_fax_line = await saveFaxLineInfo(saveFaxLineData, id);

            console.log('CREATE FORM saveFaxLineInfo', out_fax_line.fax_line_id);

            //filteredFaxItemOriginal 배열에 해당 Item[indexToSave]에 , fax_line_id_{indexToSave}의 default_value를 out_fax_line 로 변경 
            const updatedFaxItemOriginal = faxItemOriginal.map((group, groupIndex) => {
                if (groupIndex === indexToSave) {
                    return {
                        ...group,
                        items: group.items.map(item => {
                            if (item.name === `fax_line_id_${indexToSave}`) {
                                return { ...item, defaultValue: out_fax_line.fax_line_id };
                            }
                            return item;
                        })
                    };
                }
                return group;
            });
            console.log('handleSaveFaxLine updatedFaxItemOriginal', updatedFaxItemOriginal);
            setFaxItemOriginal(updatedFaxItemOriginal);
        }
         // 클라이언트 측에서 리다이렉트 처리
         router.push(`/device/${id}/edit`);
        
    }

    const handleDeleteFaxLine = async (indexToRemove?: number) => {
        console.log('----handleDeleteFaxLine----', indexToRemove);

        if (indexToRemove === undefined) return; // index가 없으면 함수 종료
    
        const inputElement = document.getElementById(`fax_line_id_${indexToRemove}`) as HTMLInputElement;

        console.log(inputElement, 'inputElement');  

        if (inputElement) {
            // const value = inputElement.value;
        }else{
            console.log('inputElement not found');
            return;
        }

        await deleteFaxLineInfo(String(inputElement.value), id);

        // 2. 해당 index를 가진 모든 요소 삭제 후 새로운 배열 반환
        // faxItemOriginal 배열 재구성
        const updatedFaxItemOriginal = faxItemOriginal.filter((_, index) => index !== indexToRemove);

        setFaxItemOriginal(updatedFaxItemOriginal);

        // 클라이언트 측에서 리다이렉트 처리
        router.push(`/device/${id}/edit`);

    };

    // ✅ useEffect에서 `deleteFaxLineInfo` 호출
    // useEffect(() => {
    //     if (deletedFaxLineId && id !== undefined) {
    //         deleteFaxLineInfo(deletedFaxLineId, id);
    //         setDeletedFaxLineId(null); // 한 번 실행 후 초기화
    //     }
    // }, [deletedFaxLineId, id]);    
        
    const handleAddFaxLine = () => {
        

        // const hasEmptyHiddenValue = faxItemOriginal.some(
        //     (item) => item.type === 'hidden' && (typeof item.defaultValue !== 'string' || item.defaultValue.trim() === '')
        // );
        
        const hasEmptyHiddenValue = faxItemOriginal.some((group) => {   
            return group.items.some((item) => {
                return item.type === 'hidden' && (typeof item.defaultValue !== 'string' || item.defaultValue.trim() === '');
            });
        });

        if (hasEmptyHiddenValue) {
            alert('회선 추가한 내용을 먼저 저장하세요');
            return;
        }

        // items가 비어 있는 그룹 제거
        const filteredFaxItemOriginal1 = faxItemOriginal.filter((group) => group.items.length > 0);

        setFaxItemOriginal([...filteredFaxItemOriginal1]); // 기존 배열에 추가

        console.log(faxItemOriginal.length, 'faxItems.length');
        let index;
        if (faxItemOriginal.length === 0){
            index = 0;
        }else{
            index = faxItemOriginal.length ; // 현재 배열 길이를 인덱스로 사용
        }
        
        console.log(index, 'faxItems.index');

        if(index >= 3) {
            alert('팩스 회선은 3개까지 추가됩니다.');
            return;
        }
        const newFaxLine: IItem = {
            items: [
            { name: `fax_line_id_${index}`, title: `팩스라인 아이디 ${index}} ${index+1}` , type: 'hidden', defaultValue: '', placeholder: 'fax.fax_line_id' },
            { name: `fax_line_name_${index}`, title: `팩스라인 번호 ${index+1}`, type: 'input', defaultValue: '', placeholder: '팩스라인 번호' },
            { 
                name: `fax_line_user_id_${index}`, title: '회선 사용자', type: 'react-select', defaultValue: { value: '', label: '-1 없음' }, placeholder: '회선 사용자',
                options: optionsUser
            },
            { 
                name: `fax_line_shared_group_id_${index}`, title: '회선 공유그룹', type: 'react-select', defaultValue: { value: '', label: '-1 없음' }, placeholder: '회선 공유그룹',
                options: optionsGroup
            },
            { name: `button_${index}`, title: '저장' , type: 'button', defaultValue: '', placeholder: '' },
            { name: `space_line_${index}`, title: 'Line 띄우기', type: 'input', defaultValue: '', placeholder: '회선 공유그룹' }
            ]
        };

         // items가 비어 있는 그룹 제거
        const filteredFaxItemOriginal = faxItemOriginal.filter((group) => group.items.length > 0);

        setFaxItemOriginal([...filteredFaxItemOriginal, newFaxLine]); // 기존 배열에 추가

    };

    // const updatedAction = !!id ? action.bind(null, id) : action;
    const updatedAction =    action;
    const [state, formAction] = useActionState(updatedAction, initialState);

    //const [state, formAction] = useActionState(increment, 0);
    
//    console.log('item', allItems);
//    console.log('faxItems', faxItems);

    //console.log('create form');
    return (
        <div>
            <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
            <div key={1} className={clsx('w-full p-2 flex flex-col md:flex-row')}>
                <div  className='w-full md:w-1/3 pb-4 md:pr-6'>
                    <div className='mb-5 text-xl font-semibold'>{title}</div>
                    <div className='text-sm'>{description}</div>
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

                        {faxItemOriginal.length > 0 ? (
                            faxItemOriginal.map((group, groupIndex) => {
                                // 외부 map: group 객체를 순회
                            return (
                                <div key={`group-${groupIndex}`}>
                                    {group.items.map((item, itemIndex) => {
                                        // 내부 map: group.items 배열을 순회
                                        if (!item.name) {
                                            console.warn(`Item at index ${itemIndex} in group ${groupIndex} is missing a name property:`, item);
                                            return null;
                                        }
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
                                                        onClick={() => {
                                                            const match = item.name.match(/_(\d+)$/);
                                                            console.log('match', item.name);
                                                            if (match && match[1]) {
                                                                handleDeleteFaxLine(parseInt(match[1], 10));
                                                            }
                                                        }}
                                                        className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                                                    >
                                                    삭제
                                                    </Button>
                                                    <Button
                                                        name={item.name}
                                                        type="button"
                                                        onClick={() => {
                                                            const match = item.name.match(/_(\d+)$/);
                                                            if (match && match[1]) {
                                                                handleSaveFaxLine(parseInt(match[1], 10));
                                                            }
                                                        }}
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
                                    })}
                                </div>  
                            );
                            }
                        )) : (
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