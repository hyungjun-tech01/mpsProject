import React from 'react';
import clsx from 'clsx';
import {
    PowerSettingsNew
} from '@mui/icons-material';
import NavLinks from './nav-links';
// import { signOut } from '@/auth';


export default function SideNav({ extended }: { extended : boolean}) {
    return (
        <div className="flex h-full flex-col px-3 py-4 md:px-2">
            <div className="grid grid-cols-auto-fit gap-2 md:flex md:flex-col md:grow md:justify-between">
                <NavLinks extended={extended} />
                <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
                <form
                    action={ () => {
                        // 'use server';
                        // await signOut();
                        console.log('sing out');
                    }}
                >
                    <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 text-gray-500 p-3 text-sm font-medium hover:bg-purple-100 hover:text-purple-600 md:flex-none md:justify-start md:p-2 md:px-3">
                        <PowerSettingsNew className="w-6" />
                        <div className={clsx("hidden duration-150",
                            {"md:block" : extended}
                        )}>Sign Out</div>
                    </button>
                </form>
            </div>
        </div>
    )
};