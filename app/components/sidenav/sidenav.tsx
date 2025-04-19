import React from 'react';
import { useSession } from "next-auth/react";
import clsx from 'clsx';
import { PowerSettingsNew } from '@mui/icons-material';
import NavLinks from './nav-links';
import { logout } from '@/app/components/auth/actions';


export default function SideNav({ extended }: { extended : boolean}) {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <div className={clsx("grid grid-cols-auto-fit gap-2",
                {"md:flex md:flex-col md:grow md:justify-between": isAdmin})}>
                <NavLinks extended={extended} />
                { isAdmin &&
                    <>
                        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
                        <form action={logout}>
                            <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 text-gray-500 p-3 text-base font-medium hover:bg-lime-100 hover:text-lime-700 md:flex-none md:justify-start md:p-2 md:px-3">
                                <PowerSettingsNew className="w-6" />
                                <div className={clsx("hidden duration-150",
                                    {"md:block" : extended}
                                )}>로그아웃</div>
                            </button>
                        </form>
                    </>
                }
            </div>
        </div>
    )
};