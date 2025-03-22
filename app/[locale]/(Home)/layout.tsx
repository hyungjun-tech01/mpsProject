'use client';

import { useState } from 'react';
import clsx from 'clsx';
import Header from '@/app/components/header';
import SideNav from '@/app/components/sidenav/sidenav';


export default function Layout({ children }: { children: React.ReactNode }) {
  const [sideNavExtended, extendSideNav] = useState(true);

  return (
    <div className="flex h-screen flex-col md:overflow-hidden">
      <Header extendSideNav={() => extendSideNav(!sideNavExtended)} />
      <div className="flex h-full flex-col md:flex-row md:overflow-hidden">
        <div className={clsx("w-full flex-none duration-150", {
          "md:w-16": !sideNavExtended,
          "md:w-64": sideNavExtended,
        })}>
          <SideNav extended={sideNavExtended}/>
        </div>
        <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
          {children}
        </div>
      </div>
    </div>
  );
}