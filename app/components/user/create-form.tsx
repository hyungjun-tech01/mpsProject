'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import { createUser, State } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form({ items }: { items: object }) {
    const initialState: State = { message: null, errors: {} };
    const [state, formAction] = useActionState(createUser, initialState);

    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                {/* User Detail */}
                <div className='w-full p-2 flex flex-col md:flex-row border-b'>
                    <div className='w-full md:w-1/3 pb-4 md:pr-6'>
                        <div className='mb-5 text-xl font-semibold'>{items.secDetailTitle}</div>
                        <div className='text-sm'>{items.secDetailDescription}</div>
                    </div>
                    <div className='w-full md:w-2/3'>
                        <div className="mb-4">
                            <label htmlFor="userName" className="mb-2 block text-sm font-semibold">
                                {items.userNameTitle}
                            </label>
                            <div className="relative mt-2 rounded-md">
                                <div className="relative">
                                    <input
                                        id="userName"
                                        name="userName"
                                        type="text"
                                        defaultValue=""
                                        placeholder={items.userNamePlaceholder}
                                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                    />
                                </div>
                                <div id='userName-error' aria-live="polite" aria-atomic="true">
                                    {state?.errors?.userName &&
                                        state.errors.userName.map((error: string) => (
                                            <p className="mt-2 text-sm text-red-500" key={error}>
                                                {error}
                                            </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="userFullName" className="mb-2 block text-sm font-semibold">
                                {items.userFullNameTitle}
                            </label>
                            <div className="relative mt-2 rounded-md">
                                <div className="relative">
                                    <input
                                        id="userFullName"
                                        name="userFullName"
                                        type="text"
                                        defaultValue=""
                                        placeholder={items.userFullNamePlaceholder}
                                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="userEmail" className="mb-2 block text-sm font-semibold">
                                {items.userEmailTitle}
                            </label>
                            <div className="relative mt-2 rounded-md">
                                <div className="relative">
                                    <input
                                        id="userEmail"
                                        name="userEmail"
                                        type="text"
                                        defaultValue=""
                                        placeholder={items.userEmailPlaceholder}
                                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                    />
                                </div>
                                <div id='userEmail-error' aria-live="polite" aria-atomic="true">
                                    {state?.errors?.userEmail &&
                                        state.errors.userEmail.map((error: string) => (
                                            <p className="mt-2 text-sm text-red-500" key={error}>
                                                {error}
                                            </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="userHomeDirectory" className="mb-2 block text-sm font-semibold">
                                {items.userHomeDirTitle}
                            </label>
                            <div className="relative mt-2 rounded-md">
                                <div className="relative">
                                    <input
                                        id="userHomeDirectory"
                                        name="userHomeDirectory"
                                        type="text"
                                        defaultValue=""
                                        placeholder={items.userHomeDirPlaceholder}
                                        className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="userDisablePrinting" className="mb-2 block text-sm font-semibold">
                                {items.userHomeDirTitle}
                            </label>
                            <div className="relative">
                                <select
                                    id='userDisablePrinting'
                                    name='userDisablePrinting'
                                    className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                    defaultValue="N"
                                    aria-describedby="disablePrinting-error"
                                >
                                    <option value="N">
                                        {items.userEnablePrintingOption}
                                    </option>
                                    <option value="Y">
                                        {items.userDisablePrintingOption}
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
                    </div>
                </div>
            </div>
            <div id="input-error" aria-live="polite" aria-atomic="true">
                {state?.message &&
                    <p className="mt-2 text-sm text-red-500">
                        {state.message}
                    </p>
                }
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/user"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    {items.btnCancel}
                </Link>
                <Button
                    type="submit"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >{items.btnCreateUser}</Button>
            </div>
        </form>
    );
}
