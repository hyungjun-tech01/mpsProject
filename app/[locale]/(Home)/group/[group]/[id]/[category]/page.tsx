import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/breadcrumbs';
import MemberTable from '@/app/components/table';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import { fetchGroupInfoByID, fetchMembersInGroupByID, fetchMembersPagesByID } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';

export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ group: string, id: string, category: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const group = params.group;
    const id = params.id;
    const category = params.category;
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;

    if (!['device', 'user', 'security'].includes(group)) {
        notFound();
    };
    if (!['detail', 'members'].includes(category)) {
        notFound();
    };
    const [t, groupInfo, totalPages, members] = await Promise.all([
        getDictionary(locale),
        fetchGroupInfoByID(id),
        fetchMembersPagesByID(query, id, itemsPerPage),
        fetchMembersInGroupByID(query, id, itemsPerPage, currentPage),
    ]);

    // Tabs ----------------------------------------------------------------------
    const subTitles = [
        { category: 'detail', title: t('group.group_details'), link: `/group/${group}/${id}/detail` },
        { category: 'members', title: t('group.group_members'), link: `/group/${group}/${id}/members` },
    ];
    const groupBreadcrumbs = {
        device: [
            { label: t('group.subTitle_device'), link: `/group/device`},
            { link: `/group/device/${id}/details`}
        ],
        user: [
            { label: t('group.subTitle_user'), link: `/group/user`},
            { link: `/group/user/${id}/details`}
        ],
        security: [
            { label: t('group.subTitme_security'), link: `/group/security`},
            { link: `/group/security/${id}/details`}
        ]
    };
    const detailItems: { device: ISection[], user: ISection[], security: ISection[] } = {
        device: [

        ],
        user: [

        ],
        security: [

        ]
    };
    const buttonItems: { device: IButtonInfo, user: IButtonInfo, security: IButtonInfo } = {
        device: {
            cancel: { title: t('common.cancel'), link: '/group/device' },
            go: { title: t('group.update_group') },
        },
        user: {
            cancel: { title: t('common.cancel'), link: '/group/user' },
            go: { title: t('common.apply') },
        },
        security: {
            cancel: { title: t('common.cancel'), link: '/group/security' },
            go: { title: t('common.apply') },
        }
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: groupBreadcrumbs[group][0].label, href: groupBreadcrumbs[group][0].link },
                    {
                        label: `${t('group.group_edit')}`,
                        href: `${groupBreadcrumbs[group][1].link}`,
                        active: true,
                    },
                ]}
            />
            <div className='w-full pl-2 flex justify-start'>
                {subTitles.map((item, idx) => {
                    return <Link key={idx} href={item.link}
                        className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                            { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === category },
                            { "text-gray-300  bg-white border-2": item.category !== category },
                        )}>{item.title}</Link>;
                })}
            </div>
            {category === 'detail' && <EditForm id={id} items={detailItems[group]} buttons={buttonItems[group]} action={null} />}
            {category === 'members' &&
                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    <MemberTable
                        columns={transactionColumns}
                        rows={groupInfo}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        editable={false}
                    />
                </div>
            }
        </main>
    );
}
