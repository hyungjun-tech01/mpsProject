'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react"
import clsx from 'clsx';
import { SideMenuList } from '@/constans';


export default function NavLinks({ extended }: { extended: boolean }) {
  const pathname = usePathname();
  const category = usePathname().split('/')[1];
  const { data: session } = useSession();

  return (
    <>
      {SideMenuList.map((link) => {
        if(session?.user?.role !== "admin" && link.name === 'user') return;

        const LinkIcon = link.icon;
        
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-base  text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700",
              {
                'bg-lime-100 text-lime-700': pathname === '/' ? link.name === "dashboard" : category === link.name,
                'grow md:flex-none md:justify-start md:p-2 md:px-3': extended,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className={clsx("hidden duration-150",
              { 'md:block': extended }
            )}>{link.title}</p>
          </Link>
        );
      })}
    </>
  );
}
