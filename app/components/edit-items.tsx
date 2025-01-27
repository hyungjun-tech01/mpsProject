'use client';

import { ChangeEvent, useState } from 'react';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { formatCurrency } from "../lib/utils";

export interface IEditItem {
    name: string;
    title: string;
    type: 'label' | 'input' | 'currency' | 'select' | 'checked';
    defaultValue: string | number;
    placeholder?: string;
    options?: { title: string, value: string | number }[] | null;
    locale?: string;
    error?: string[];
}

export function EditItem({
    name,
    title,
    type,
    defaultValue,
    placeholder,
    options,
    locale,
    error,
}: IEditItem
) {
    const [checked, setChecked] = useState(defaultValue === 'Y');

    switch (type) {
        case 'label':
            return (
                <div className="mb-4">
                    <label htmlFor={name} className="mb-2 block text-sm font-semibold">
                        {title}
                    </label>
                    <div className="relative">
                        <label htmlFor={name} className="mb-2 block text-sm font-medium">
                            {defaultValue}
                        </label>
                    </div>
                </div>
            );
        case 'input':
            return (
                <div className="mb-4">
                    <label htmlFor={name} className="mb-2 block text-sm font-semibold">
                        {title}
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                            <input
                                id={name}
                                name={name}
                                type="text"
                                defaultValue={defaultValue}
                                placeholder={placeholder}
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                required
                            />
                        </div>
                        <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
                            {error && error.map((error: string) => (
                                <p className="mt-2 text-sm text-red-500" key={error}>
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'currency':
            return (
                <div className="mb-4">
                    <label htmlFor={name} className="mb-2 block text-sm font-semibold">
                        {title}
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                            <input
                                id={name}
                                name={name}
                                type="text"
                                defaultValue={formatCurrency(defaultValue, locale)}
                                placeholder={placeholder}
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                required
                            />
                            {!locale || locale === 'ko' && (<div className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900">₩</div>)}
                            {locale && locale === 'en' && <PaidOutlinedIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />}
                        </div>
                        <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
                            {error && error.map((error: string) => (
                                <p className="mt-2 text-sm text-red-500" key={error}>
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'checked':
            return (
                <div className="mb-4">
                    <div className="relative mt-2 rounded-md">
                        <div className="relative flex">
                            <input
                                id={name}
                                name={name}
                                type="checkbox"
                                checked={checked}
                                onChange={(e:ChangeEvent)=>setChecked(!checked)}
                            />
                            <label htmlFor={name} className="ml-2 block text-sm font-medium">
                                {title}
                            </label>
                        </div>
                        <div id={`${name}-error`} aria-live="polite" aria-atomic="true">
                            {error && error.map((error: string) => (
                                <p className="mt-2 text-sm text-red-500" key={error}>
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'select':
            return (
                <div className="mb-4">
                    <label htmlFor={name} className="mb-2 block text-sm font-semibold">
                        {title}
                    </label>
                    <div className="relative">
                        <select
                            id={name}
                            name={name}
                            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                            defaultValue={defaultValue}
                            aria-describedby="customer-error"
                        >
                            {options && options.map(item => (
                                <option key={item.value} value={item.value}>{item.title}</option>
                            ))}
                        </select>
                    </div>
                    <div id="customer-error" aria-live="polite" aria-atomic="true">
                        {error && error.map((error: string) => (
                            <p className="mt-2 text-sm text-red-500" key={error}>
                                {error}
                            </p>
                        ))}
                    </div>
                </div>
            );
    };
}