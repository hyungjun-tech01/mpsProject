'use client';

import { SalespersonField } from '@/app/lib/definitions';
import Link from 'next/link';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/CheckOutlined';
import ClockIcon from '@mui/icons-material/ScheduleOutlined';
// import CurrencyDollarIcon from '@mui/icons-material/PaidOutlined';
import UserCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import { createUser, State } from './actions';
import { useActionState } from 'react';


export default function Form({
  salespersons
}: {
  salespersons: SalespersonField[]
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createUser, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">

        {/* Salesperson Name */}
        <div className="mb-4">
          <label htmlFor="salesperson" className="mb-2 block text-sm font-medium">
            Choose salesperson
          </label>
          <div className="relative">
            <select
              id="salesperson"
              name="salespersonId"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue=""
              aria-describedby="salesperson-error"
            >
              <option value="" disabled>
                Select a salesperson
              </option>
              {salespersons.map((salesperson) => (
                <option key={salesperson.userId} value={salesperson.userName}>
                  {salesperson.userName}
                </option>
              ))}
            </select>
            <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          <div id="salesperson-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.salespersonId &&
              state.errors.salespersonId.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Company Memo */}
        <fieldset>
          <legend className="mb-2 block text-sm font-medium">
            Set the company memo
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="pending"
                  name="status"
                  type="radio"
                  value="pending"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="pending"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Pending <ClockIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="paid"
                  name="status"
                  type="radio"
                  value="paid"
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="paid"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid <CheckIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
          <div id="customer-error" aria-live="polite" aria-atomic="true">
            {state?.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </fieldset>

        <div id="customer-error" aria-live="polite" aria-atomic="true">
          {state?.message &&
            <p className="mt-2 text-sm text-red-500">
              {state.message}
            </p>
          }
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/user"
          className="flex h-10 items-center rounded-lg bg-lime-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-lime-200"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          className="flex h-10 items-center rounded-lg bg-lime-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-lime-200"
        >Create User</Button>
      </div>
    </form>
  );
}
