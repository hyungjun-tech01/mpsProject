import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import EditForm from '@/app/components/user/edit-form';
import JobLog from '@/app/components/user/jobLogTable';
import Breadcrumbs from '@/app/components/user/breadcrumbs';
import { IEditItem } from '@/app/components/edit-items';
import LogTable from '@/app/components/table';

import getDictionary from '@/app/locales/dictionaries';
import { IColumnData } from '@/app/lib/definitions';
import { fetchUserById, fetchTransactionsByAccountId, fetchTransactionsPagesByAccountId } from '@/app/lib/fetchData';
import { formatCurrency } from "@/app/lib/utils";

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

    if(!['edit', 'charge', 'transaction', 'jobLog'].includes(job)){
        notFound();
    }

    const [transactionInfo, transcationCount] = await Promise.all([
        fetchTransactionsByAccountId(user.account_id),
        fetchTransactionsPagesByAccountId(user.account_id, 10),
    ]);

    console.log('Check : ', transactionInfo);

    const subTitles = [
        { category: 'edit', title: t('user.subTitle_detail'), link: `/user/${id}/edit` },
        { category: 'charge', title: t('user.subTitle_budget'), link: `/user/${id}/charge` },
        { category: 'transaction', title: t('user.subTitle_ProcessedLog'), link: `/user/${id}/transaction` },
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
            { name: 'balance_current', title: t('account.balance_current'), type: 'label', defaultValue: formatCurrency(user.balance, locale) },
            { name: 'balance_new', title: t('account.balance_new'), type: 'currency', defaultValue: 0, locale: locale },
            { name: 'txn_comment', title: t('common.explanation'), type: 'input', defaultValue: "" },
        ],
    };

    const transactionColumns: IColumnData[] = [
            { name: 'transaction_date', title: t('account.transaction_date'), type: 'date' },
            { name: 'transacted_by', title: t('account.transaction_by'), align: 'center' },
            { name: 'amount', title: t('common.price_1'), align: 'center', type: 'currency' },
            { name: 'balance', title: t('account.balance'), align: 'center' },
            { name: 'transaction_type', title: t('account.transaction_type'), align: 'center' },
            { name: 'txn_comment', title: t('common.explanation'), align: 'center' },
        ];

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
            {job === 'transaction' &&
                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    <LogTable
                        columns={transactionColumns}
                        rows={transactionInfo}
                        currentPage={0}
                        totalPages={transcationCount}
                        editable={false}
                    />
                </div>
            }
            {job === 'jobLog' && <JobLog id={id}/>}
        </main>
    );
}