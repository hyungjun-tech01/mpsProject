'use client';

import {
  ArrowForwardOutlined,
  KeyOutlined,
  ErrorOutlineOutlined
} from '@mui/icons-material';
import { Button } from '@mui/material';
import { useActionState } from 'react';
import { authenticate } from '@/app/components/auth/actions';
import { useSearchParams } from 'next/navigation';


export default function LoginForm({
  languageData
}:{
  languageData: {title: string, userId: string, password:string, login:string}
}) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} >
      <div className="flex-1 rounded-b-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className="mb-3 text-2xl">
          {languageData.title}
        </h1>
        <div className="w-full">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="user_name"
            >
              {languageData.userId}
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="user_name"
                type="user_name"
                name="user_name"
                placeholder="Enter your ID"
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="user_password"
            >
              {languageData.password}
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="user_password"
                type="password"
                name="user_password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyOutlined className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <Button type="submit" className="mt-8 w-full bg-lime-200  px-3 py-0.5" aria-disabled={isPending}>
          {languageData.login} <ArrowForwardOutlined className="ml-auto h-5 w-5 text-gray-500" />
        </Button>
        <div className="flex h-8 items-end space-x-1">
          {errorMessage && (
            <>
              <ErrorOutlineOutlined className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
