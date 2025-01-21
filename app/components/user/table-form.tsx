'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import { modifyUser, State } from '@/app/lib/actions';
import { useActionState } from 'react';


export default function TableForm() {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(modifyUser, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">

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
        <Button
          type="submit"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >Update User</Button>
      </div>
    </form>
  );
}
