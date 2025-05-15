'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import type { UserState } from '@/app/lib/actions';
import { ChangeEvent, useActionState, useState, useEffect } from 'react';
import { EditItem } from '../edit-items';
import Grouping from '../grouping';
import { Group, UserGroup } from '@/app/lib/definitions';


export function UserForm({
    id,
    userData,
    locale,
    translated,
    candidates,
    outGroup,
    inGroup,
    action,
}: {
    id?: string;
    userData: Group;
    locale: string;
    translated: object;
    candidates: { value: string, title: string }[],
    outGroup: { paramName: string, totalPages: number, members: UserGroup[] };
    inGroup: { paramName: string, totalPages: number, members: UserGroup[] } | null;
    action: (
        id: string | undefined,
        prevState: UserState,
        formData: FormData
    ) => Promise<void>;
}) {
    const initialState: UserState = { message: null, errors: {} };
    const updatedAction = !!id ? action.bind(null, id) : action;
    const [state, formAction] = useActionState(updatedAction, initialState);
    const [schedulePeriod, SetSchedulePeriod] = useState<string>(userData.schedule_period);
    const [scheduleStart, SetScheduleStart] = useState<number>(userData.schedule_start % 100);
    const [subScheduleStartSub, SetSubScheduleStart] = useState<number>(Math.floor(userData.schedule_start / 100));
    const [optionsForYearDate, setOptionsForYearDate] = useState<{ title: string, value: number }[]>([]);

    const optionsForSchedulePeriod = [
        { title: translated.none, value: "NONE" },
        { title: translated.per_day, value: "PER_DAY" },
        { title: translated.per_week, value: "PER_WEEK" },
        { title: translated.per_month, value: "PER_MONTH" },
        { title: translated.per_year, value: "PER_YEAR" },
    ];

    const optionsForWeek = [
        { title: translated.sunday, value: 0 },
        { title: translated.monday, value: 1 },
        { title: translated.tuesday, value: 2 },
        { title: translated.wednesday, value: 3 },
        { title: translated.thursday, value: 4 },
        { title: translated.friday, value: 5 },
        { title: translated.saturday, value: 6 },
    ];

    const optionsForMonth = [];
    if (locale === 'ko') {
        for (let i = 1; i <= 31; i++) {
            optionsForMonth.push({ title: i.toString() + " 일", value: i });
        };
    }
    else if (locale === 'en') {
        optionsForMonth.push({ title: '1st', value: 1 });
        optionsForMonth.push({ title: '2nd', value: 2 });
        optionsForMonth.push({ title: '3rd', value: 2 });
        for (let i = 4; i <= 31; i++) {
            optionsForMonth.push({ title: i.toString() + "th", value: i });
        };
    }

    const optionsForYearMonth = [];
    if (locale === 'ko') {
        for (let i = 1; i <= 12; i++) {
            optionsForYearMonth.push({ title: i.toString() + " 월", value: i });
        };
    }
    else if (locale === 'en') {
        optionsForYearMonth.push({ title: 'Jan', value: 1 });
        optionsForYearMonth.push({ title: 'Feb', value: 2 });
        optionsForYearMonth.push({ title: 'Mar', value: 3 });
        optionsForYearMonth.push({ title: 'Apr', value: 4 });
        optionsForYearMonth.push({ title: 'May', value: 5 });
        optionsForYearMonth.push({ title: 'Jun', value: 6 });
        optionsForYearMonth.push({ title: 'Jul', value: 7 });
        optionsForYearMonth.push({ title: 'Aug', value: 8 });
        optionsForYearMonth.push({ title: 'Sep', value: 9 });
        optionsForYearMonth.push({ title: 'Oct', value: 10 });
        optionsForYearMonth.push({ title: 'Nov', value: 11 });
        optionsForYearMonth.push({ title: 'Feb', value: 12 });
    }

    const genOptionsForYearDate = (month: number) => {
        let endDate = 31;
        if (month === 2) {
            endDate = 28;
        } else if (month in [4, 6, 9, 11]) {
            endDate = 30;
        }
        let regenOptions = [];
        if (locale === 'ko') {
            for (let i = 1; i <= endDate; i++) {
                regenOptions.push({ title: i.toString() + " 일", value: i });
            }
        } else if (locale === 'en') {
            regenOptions.push({ title: '1st', value: 1 });
            regenOptions.push({ title: '2nd', value: 2 });
            regenOptions.push({ title: '3rd', value: 3 });
            for (let i = 4; i <= endDate; i++) {
                regenOptions.push({ title: i.toString() + "th", value: i });
            }
        }
        setOptionsForYearDate(regenOptions);
    };

    const handleChangeScheduleStart = (event: ChangeEvent) => {
        const chosenValue = Number(event.target.value);
        SetScheduleStart(chosenValue);
        genOptionsForYearDate(chosenValue);
    };

    useEffect(() => {
        if (userData.schedule_start > 100) {
            SetScheduleStart(Math.floor(userData.schedule_start / 100));
            SetSubScheduleStart(userData.schedule_start % 100);
        } else {
            SetScheduleStart(userData.schedule_start);
        }
    }, [userData])

    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-50 p-4 md:p-6">
                <div className={'w-full p-2 flex flex-col md:flex-row border-b'}>
                    <div className='w-full md:w-1/3 pb-4 md:pr-6'>
                        <div className='mb-5 text-xl font-semibold'>{translated.title_generals}</div>
                        <div className='text-sm'>{translated.desc_generals}</div>
                    </div>
                    <div className='w-full md:w-2/3'>
                        <EditItem
                            name="group_name"
                            title={translated.group_name}
                            type="input"
                            defaultValue={userData.group_name}
                            placeholder={translated.placeholder_group_name}
                            error={(!!state?.errors && !!state?.errors.group_name)
                                ? state?.errors.group_name
                                : null
                            }
                        />
                        <EditItem
                            name="group_notes"
                            title={translated.common_note}
                            type="input"
                            defaultValue={userData.group_notes}
                            error={(!!state?.errors && !!state?.errors.group_name)
                                ? state?.errors.group_name
                                : null
                            }
                        />
                    </div>
                </div>
                <div className={'w-full p-2 flex flex-col md:flex-row border-b'}>
                    <div className='w-full md:w-1/3 pb-4 md:pr-6'>
                        <div className='mb-5 text-xl font-semibold'>{translated.title_schedule_quota}</div>
                        <div className='text-sm'>{translated.desc_schedule_quota}</div>
                    </div>
                    <div className='w-full md:w-2/3'>
                        <EditItem
                            name="schedule_period"
                            title={translated.group_schedule_period}
                            type="select"
                            defaultValue={userData.schedule_period}
                            options={optionsForSchedulePeriod}
                            onChange={(event: ChangeEvent) => {
                                SetSchedulePeriod(event.target.value);
                            }}
                            error={(!!state?.errors && !!state?.errors.group_name)
                                ? state?.errors.group_name
                                : null
                            }
                        />
                        {schedulePeriod !== "NONE" && schedulePeriod !== "PER_DAY" &&
                            <div className="mb-4">
                                <label htmlFor="schedule_start" className="mb-2 block text-sm font-semibold">
                                    {translated.group_schedue_start}
                                </label>
                                <div className="relative">
                                    {schedulePeriod === "PER_WEEK" &&
                                        <select
                                            id="schedule_start"
                                            name="schedule_start"
                                            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                            defaultValue={scheduleStart}
                                            aria-describedby={"schedule_start-error"}
                                            onChange={(event: ChangeEvent) => {
                                                // console.log("Change Schedule Period :", event.target.value);
                                                SetScheduleStart(event.target.value);
                                            }}
                                        >
                                            {optionsForWeek.map(day =>
                                                <option key={day.value} value={day.value}>
                                                    {day.title}
                                                </option>
                                            )}
                                        </select>
                                    }
                                    {schedulePeriod === "PER_MONTH" &&
                                        <select
                                            id="schedule_start"
                                            name="schedule_start"
                                            className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                            defaultValue={scheduleStart}
                                            aria-describedby={"schedule_start-error"}
                                            onChange={(event: ChangeEvent) => {
                                                // console.log("Change Schedule Period :", event.target.value);
                                                SetScheduleStart(event.target.value);
                                            }}
                                        >
                                            {optionsForMonth.map(day =>
                                                <option key={day.value} value={day.value}>
                                                    {day.title}
                                                </option>
                                            )}
                                        </select>
                                    }
                                    {schedulePeriod === "PER_YEAR" &&
                                        <div className='flex gap-4'>
                                            <select
                                                id="schedule_start"
                                                name="schedule_start"
                                                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                                defaultValue={Math.floor(scheduleStart)}
                                                aria-describedby={"schedule_start-error"}
                                                onChange={handleChangeScheduleStart}
                                            >
                                                {optionsForYearMonth.map(month =>
                                                    <option key={month.value} value={month.value}>
                                                        {month.title}
                                                    </option>
                                                )}
                                            </select>
                                            <select
                                                id="schedule_start"
                                                name="schedule_start_sub"
                                                className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                                                defaultValue={subScheduleStartSub}
                                                aria-describedby={"schedule_start-error"}
                                                onChange={(event: ChangeEvent) => {
                                                    // console.log("Change Schedule Period :", event.target.value);
                                                    SetSubScheduleStart(event.target.value);
                                                }}
                                            >
                                                {optionsForYearDate.map(day =>
                                                    <option key={day.value} value={day.value}>
                                                        {day.title}
                                                    </option>
                                                )}
                                            </select>
                                        </div>
                                    }
                                </div>
                                <div id="schedule_start-error" aria-live="polite" aria-atomic="true">
                                    {!!state?.errors && !!state?.errors.schedule_start &&
                                        state?.errors.schedule_start.map((error: string) => (
                                            <p className="mt-2 text-sm text-red-500" key={error}>
                                                {error}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        }
                        <EditItem
                            name="schedule_amount"
                            title={translated.group_schedule_amount}
                            type="currency"
                            defaultValue={userData.schedule_amount}
                            error={(!!state?.errors && !!state?.errors.group_name)
                                ? state?.errors.group_name
                                : null
                            }
                        />
                        {!!id &&
                            <EditItem
                                name="remain_amount"
                                title={translated.group_remain_amount}
                                type="currency"
                                defaultValue={userData.remain_amount}
                                error={(!!state?.errors && !!state?.errors.group_name)
                                    ? state?.errors.group_name
                                    : null
                                }
                            />
                        }
                    </div>
                </div>
                <div className={'w-full p-2 flex flex-col md:flex-row border-b'}>
                    <div className='w-full md:w-1/3 pb-4 md:pr-6'>
                        <div className='mb-5 text-xl font-semibold'>{translated.group_manager}</div>
                        <div className='text-sm'>{" "}</div>
                    </div>
                    <div className='w-full md:w-2/3'>
                        <EditItem
                            name="group_manager"
                            title={translated.group_manager}
                            type="select"
                            defaultValue={userData.group_manager}
                            placeholder=""
                            options={candidates}
                            error={(!!state?.errors && !!state?.errors.group_manager)
                                ? state?.errors.group_manager
                                : null
                            }
                        />
                    </div>
                </div>
                <Grouping
                    title={translated.title_grouping}
                    noneGroupMemberTitle={translated.none_group_member}
                    noneGroupSearchPlaceholder={translated.search_placeholder_in_nonegroup}
                    groupMemberTitle={translated.group_member}
                    groupSearchPlaceholder={translated.search_placeholder_in_group}
                    outGroup={outGroup}
                    inGroup={inGroup}
                />
                <div id="input-error" aria-live="polite" aria-atomic="true">
                    {!!state?.message &&
                        <p className="mt-2 text-sm text-red-500">
                            {state.message}
                        </p>
                    }
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href='/group/user'
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    {translated.button_cancel}
                </Link>
                <Button
                    type="submit"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    {translated.button_go}
                </Button>
            </div>
        </form>
    );
}
