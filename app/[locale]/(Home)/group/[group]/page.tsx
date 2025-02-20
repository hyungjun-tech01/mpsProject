import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';
import Search from '@/app/components/search';
import Table from '@/app/components/table';
import { CreateButton } from '@/app/components/buttons';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ group: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const group = params.group;
    const locale = params.locale;

    const [t] = await Promise.all([
        getDictionary(locale),
    ]);
    const deviceGroupData = [];
    const userGroupData = [];
    const securityGroupData = [];

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };

    // Items -------------------------------------------------------------------
    const subTitles = [
        { category: 'device', title: t('group.subTitle_device'), link: `/group/${group}` },
        { category: 'user', title: t('group.subTitle_user'), link: `/group/${group}` },
        { category: 'security', title: t('group.subTitle_security'), link: `/group/${group}` },
    ];

        return (
            <div className='w-full pl-2 flex-col justify-start'>
                {subTitles.map((item, idx) => {
                    return <Link key={idx} href={item.link}
                        className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                            { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === group },
                            { "text-gray-300  bg-white border-2": item.category !== group },
                        )}>{item.title}</Link>;
                })}
                <div className="w-full">
                <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                    <Search placeholder="Search users..." />
                    <CreateButton link="/user/create" title="Create User" />
                </div>
                {/* <Table
                    columns={columns}
                    rows={users}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    category='user'
                    locale={locale}
                    deleteAction={deleteUser}
                /> */}
                </div>
            </div>
        );
}