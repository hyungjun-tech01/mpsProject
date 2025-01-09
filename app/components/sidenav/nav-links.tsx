'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { SideMenuList } from '@/constans';


export default function NavLinks({ extended }: { extended: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {SideMenuList.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm  text-gray-500 font-medium duration-150 hover:bg-purple-100 hover:text-purple-600",
              {
                'bg-purple-100 text-purple-600': pathname.includes(link.href),
                'grow md:flex-none md:justify-start md:p-2 md:px-3': extended,
              }
            )}
          >
            <LinkIcon className="w-6" />
            <p className={clsx("hidden duration-150",
              { 'md:block': extended }
            )}>{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
