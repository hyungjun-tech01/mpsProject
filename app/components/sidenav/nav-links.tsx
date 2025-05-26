'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import clsx from 'clsx';
import { SideMenuList } from '@/constans';
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';


// export default function NavLinks({ extended }: { extended: boolean }) {
//   const pathname = usePathname();
//   const category = usePathname().split('/')[1];
//   const { data: session } = useSession();
//   const userRole = session?.user?.role ?? "user";


//   const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

//   const toggleSubmenu = (menuName: string) => {
//     setExpandedMenu(expandedMenu === menuName ? null : menuName);
//   };



//   return (
//     <>
//       { SideMenuList[userRole].map((link) => {
//         if(session?.user?.role !== "admin" && link.name === 'user') return;

//         const LinkIcon = link.icon;
        
//         return (
//           <Link
//             key={link.name}
//             href={link.href}
//             className={clsx(
//               "flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-base  text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700",
//               {
//                 'bg-lime-100 text-lime-700': pathname === '/' ? link.name === "dashboard" : category === link.name,
//                 'grow md:flex-none md:justify-start md:p-2 md:px-3': extended,
//               }
//             )}
//           >
//             <LinkIcon className="w-6" />
//             <p className={clsx("hidden duration-150",
//               { 'md:block': extended }
//             )}>{link.title}</p>
//           </Link>
//         );
//       })}
//     </>
//   );

// return (
//   <>
//     {SideMenuList[userRole].map((link) => {
//         if(session?.user?.role !== "admin" && link.name === 'user') return;

//         const LinkIcon = link.icon;
//         const isExpanded = expandedMenu === link.name;
        
//         return (
//           <div key={link.name}>
//             {link.name === 'settings' ? (
//               // settings 메뉴는 클릭 시 하위 메뉴 토글
//               <div
//                 onClick={() => toggleSubmenu(link.name)}
//                 className={clsx(
//                   "flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-base text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700 cursor-pointer",
//                   {
//                     'bg-lime-100 text-lime-700': pathname === '/' ? link.name === "dashboard" : category === link.name,
//                     'grow md:flex-none md:justify-start md:p-2 md:px-3': extended,
//                   }
//                 )}
//               >
//                 <LinkIcon className="w-6" />
//                 <p className={clsx("hidden duration-150",
//                   { 'md:block': extended }
//                 )}>{link.title}</p>
//               </div>
//             ) : (
//               // 다른 메뉴는 기존처럼 Link 컴포넌트 사용
//               <Link
//                 href={link.href}
//                 className={clsx(
//                   "flex h-[48px] items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-base text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700",
//                   {
//                     'bg-lime-100 text-lime-700': pathname === '/' ? link.name === "dashboard" : category === link.name,
//                     'grow md:flex-none md:justify-start md:p-2 md:px-3': extended,
//                   }
//                 )}
//               >
//                 <LinkIcon className="w-6" />
//                 <p className={clsx("hidden duration-150",
//                   { 'md:block': extended }
//                 )}>{link.title}</p>
//               </Link>
//             )}

//            {link.submenu?.map((subItem: any) => {
//   const SubItemIcon = subItem.icon;
//   return (
//     <Link
//       key={subItem.name}
//       href={subItem.href}
//       className={clsx(
//         "flex h-[40px] items-center gap-2 text-sm text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700",
//         {
//           'bg-lime-100 text-lime-700': pathname === subItem.href
//         }
//       )}
//     >
//       <SubItemIcon className="w-5" />
//       {subItem.title}
//     </Link>
//   );
// })}
//           </div>
//         );
//       })}
//   </>
// );

// }


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
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
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
                    'bg-lime-100 text-lime-700': pathname === '/' ? link.name === "dashboard" : category === link.name,
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
              <div className="pl-8">
                {link.submenu.map((subItem) => {
                  const SubItemIcon = subItem.icon;
                  return (
                    <Link
                      key={subItem.name}
                      href={subItem.href}
                      className={clsx(
                        "flex h-[40px] items-center gap-2 text-sm text-gray-500 font-medium duration-150 hover:bg-lime-100 hover:text-lime-700",
                        {
                          'bg-lime-100 text-lime-700': pathname === subItem.href
                        }
                      )}
                    >
                      <SubItemIcon className="w-5" />
                      {subItem.title}
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