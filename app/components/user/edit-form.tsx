'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import { modifyUser, State } from '@/app/lib/actions';
import { useActionState } from 'react';
import { IEditItem, EditItem } from '../edit-items';


export default function EditUserForm({
  items
}: {
  items: IEditItem[];
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(modifyUser, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {items.map((item: IEditItem) => {
          return (
            <EditItem
              key={item.name}
              name={item.name}
              title={item.title}
              type={item.type}
              defaultValue={item.defaultValue}
              placeholder={item.placeholder}
              options={item.options}
              error={state.errors[item.name]}
            />
          )
        })}

        <div id="user-error" aria-live="polite" aria-atomic="true">
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
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Update User</Button>
      </div>
    </form>
  );
}
