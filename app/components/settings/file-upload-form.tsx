'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import clsx from 'clsx';
import type { UserState } from '@/app/lib/actions';
import { useActionState } from 'react';
import { IButtonInfo, IEditItem, ISection, EditItem } from '../edit-items';


export function FileUpload({
  title,
  accepted,
  action,
}: {
  title: string;
  accepted: string;
  action: (prevState: UserState, formData: FormData) => Promise<void>;
}) {
  const initialState: UserState = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="submit"
            className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
          >
            Upload
          </Button>
        </div>
    </form>
  );
}
