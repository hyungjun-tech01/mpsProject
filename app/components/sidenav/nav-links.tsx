'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import clsx from 'clsx';
import { SideMenuList } from '@/constans';
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';


// 타입 정의 추가
interface MenuItem {
  name: string;
  title: string;
  href: string;
  icon: any;
  submenu?: {
    name: string;
    title: string;
    href: string;
    icon: any;
  }[];
}

export default function NavLinks({ extended }: { extended: boolean }) {
  const pathname = usePathname();
  const category = usePathname().split('/')[1];
  const { data: session } = useSession();
  const userRole = session?.user?.role ?? "user";
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const toggleSubmenu = (menuName: string) => {
    if (menuName === 'settings') {
      setExpandedMenu(expandedMenu === menuName ? null : menuName);
    } else {
      setExpandedMenu(null);  // 다른 메뉴 클릭 시 settings 메뉴 닫기
    }
  };

  return (
    <>
      {SideMenuList[userRole as keyof typeof SideMenuList].map((link: MenuItem) => {
        if(session?.user?.role !== "admin" && link.name === 'user') return null;

        const LinkIcon = link.icon;
        const isExpanded = expandedMenu === link.name;
        
        return (
          <div key={link.name}>
            {link.name === 'settings' ? (
              <div
                onClick={() => toggleSubmenu(link.name)}
                className={clsx(
                  "flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-base text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700 cursor-pointer",
                  {
                    'bg-lime-100 text-lime-700': isExpanded && !link.submenu?.some(subItem => pathname.startsWith(subItem.href)),
                    'grow md:flex-none md:justify-start md:p-2 md:px-3': extended,
                  }
                )}
              >
                <LinkIcon className="w-6" />
                <p className={clsx("hidden duration-150",
                  { 'md:block': extended }
                )}>{link.title}</p>
              </div>
            ) : (
              <Link
                href={link.href}
                onClick={() => setExpandedMenu(null)} 
                className={clsx(
                  "flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-base text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700",
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
            )}

            {link.name === 'settings' && isExpanded && link.submenu && (
              <div>
                {link.submenu.map((subItem) => {
                  const SubItemIcon = subItem.icon;
                  const isActive = pathname.startsWith(subItem.href);  // 이 부분 수정
                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={clsx(
                        "flex h-[40px] items-center mt-2 mb-2 rounded-md text-sm text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700",
                        {
                          'bg-lime-100 text-lime-700': isActive,  // 이 부분 수정,
                          'grow md:flex-none md:justify-start md:py-2 md:pl-3 md:ml-8': extended,
                          'ml-2 p-2': !extended
                        }
                      )}
                    > 
                      <SubItemIcon className="w-5" />
                      <p className={clsx("hidden duration-150",
                        { 'md:block': extended }
                      )}>{subItem.title}</p>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}