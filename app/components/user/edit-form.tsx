'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import clsx from 'clsx';
import { State } from '@/app/lib/actions';
import { useActionState } from 'react';
import { IButtonInfo, IEditItem, ISection, EditItem } from '../edit-items';


export function EditForm({
  items,
  buttons,
  action,
}: {
  items: ISection[];
  buttons?: IButtonInfo[];
  action: (prevState: State, formData: FormData) => Promise<void>;
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {items.map((sec: ISection, idx) => {
          return (
            <div key={idx} className={clsx('w-full p-2 flex flex-col md:flex-row',
              { 'border-b': idx !== items.length - 1 }
            )}>
              <div className='w-full md:w-1/3 pb-4 md:pr-6'>
                <div className='mb-5 text-xl font-semibold'>{sec.title}</div>
                <div className='text-sm'>{sec.description}</div>
              </div>
              <div className='w-full md:w-2/3'>
                {sec.items.map((item: IEditItem) =>
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
                )}
              </div>
            </div>
          )
        })}
        <div id="input-error" aria-live="polite" aria-atomic="true">
          {state?.message &&
            <p className="mt-2 text-sm text-red-500">
              {state.message}
            </p>
          }
        </div>
      </div>
      {!!buttons &&
        <div className="mt-6 flex justify-end gap-4">
          {buttons.map((button, idx) => {
            if (button.isButton) {
              return (
                <Button
                  key={idx}
                  type="submit"
                  className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  {button.title}
                </Button>
              );
            } else {
              return (
                <Link
                  key={idx}
                  href={button.link}
                  className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                  {button.title}
                </Link>
              );
            }
          })}
        </div>
      }
    </form>
  );
}
