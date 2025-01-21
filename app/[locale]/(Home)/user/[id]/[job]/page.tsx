import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';
import EditForm from '@/app/components/user/edit-form';
import TableForm from '@/app/components/user/table-form';
import Breadcrumbs from '@/app/components/user/breadcrumbs';
import { fetchUserById } from '@/app/lib/fetchData';
import getDictionary from '@/app/locales/dictionaries';
import { IEditItem } from '@/app/components/edit-items';


export default async function Page(
    props: { params: Promise<{ id: string, job: string, locale: "ko" | "en" }> }
) {
    const params = await props.params;
    const id = params.id;
    const job = params.job;
    const locale = params.locale;
    const [t, user] = await Promise.all([
        getDictionary(locale),
        fetchUserById(id)
    ]);

    if (!user) {
        notFound();
    }

    if(!['edit', 'charge', 'processLog', 'jobLog'].includes(job)){
        notFound();
    }

    const subTitles = [
        { category: 'edit', title: t('user.subTitle_detail'), link: `/user/${id}/edit` },
        { category: 'charge', title: t('user.subTitle_budget'), link: `/user/${id}/charge` },
        { category: 'processLog', title: t('user.subTitle_ProcessedLog'), link: `/user/${id}/processLog` },
        { category: 'jobLog', title: t('user.subTitle_jobLog'), link: `/user/${id}/jobLog` }
    ];

    const items: { edit: IEditItem[], charge: IEditItem[] } = {
        edit: [
            { name: 'user_name', title: t('user.user_name'), type: 'label', defaultValue: user.user_name },
            { name: 'full_name', title: t('user.full_name'), type: 'input', defaultValue: user.full_name, placeholder: t('user.placeholder_full_name') },
            { name: 'email', title: t('common.email'), type: 'input', defaultValue: user.email, placeholder: t('user.placeholder_email') },
            { name: 'home_directory', title: t('user.home_directory'), type: 'input', defaultValue: user.home_directory, placeholder: t('user.placeholder_home_directory') },
            {
                name: 'disabled_printing', title: t('user.enable_disable_printing'), type: 'select', defaultValue: user.disabled_printing, options: [
                    { title: t('user.enable_printing'), value: 'N' },
                    { title: t('user.disable_printing'), value: 'Y' }
                ]
            },
            { name: 'department', title: t('user.department'), type: 'input', defaultValue: user.department, placeholder: t('user.placeholder_department') },
        ],
        charge: [
            { name: 'net_total_megabytes', title: t('user.balance_current'), type: 'label', defaultValue: user.net_total_megabytes },
            { name: 'full_name', title: t('user.balance_new'), type: 'input', defaultValue: user.net_total_megabytes },
            { name: 'notes', title: t('common.explanation'), type: 'input', defaultValue: user.notes },
        ],
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('common.user'), href: '/user' },
                    {
                        label: t('user.edit_user'),
                        href: `/user/${id}/${job}`,
                        active: true,
                    },
                ]}
            />
            <div className='w-full pl-2 flex justify-start'>
                {subTitles.map((item, idx) => {
                    return <Link key={idx} href={item.link}
                        className={clsx("w-auto px-2 py-1 h-auto rounded-t-lg border-solid",
                            { "font-medium text-lime-900 bg-gray-50 border-x-2 border-t-2": item.category === job },
                            { "text-gray-300  bg-white border-2": item.category !== job },
                        )}>{item.title}</Link>;
                })}
            </div>
            {(job === 'edit' || job === 'charge') && <EditForm items={items[job]} />}
            {(job === 'processLog' || job === 'jobLog') && <TableForm />}
        </main>
    );
}