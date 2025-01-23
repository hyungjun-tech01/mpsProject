import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { EditForm, ISection } from '@/app/components/user/edit-form';
import JobLog from '@/app/components/user/jobLogTable';
import Breadcrumbs from '@/app/components/user/breadcrumbs';
import LogTable from '@/app/components/table';

import getDictionary from '@/app/locales/dictionaries';
import { IColumnData } from '@/app/lib/definitions';
import {
    fetchUserById,
    fetchTransactionsByAccountId,
    fetchTransactionsPagesByAccountId,
    fetchPrinterUsageLogByUserId,
    fetchPrinterUsageLogPagesByUserId
} from '@/app/lib/fetchData';
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

    if (!['edit', 'charge', 'transaction', 'jobLog'].includes(job)) {
        notFound();
    }

    const [transactionInfo, transcationCount, printerUsageInfo, printerUsageCount] = await Promise.all([
        fetchTransactionsByAccountId(user.account_id, 10, 1),
        fetchTransactionsPagesByAccountId(user.account_id, 10),
        fetchPrinterUsageLogByUserId(id, 10, 1),
        fetchPrinterUsageLogPagesByUserId(id, 10)
    ]);

    const subTitles = [
        { category: 'edit', title: t('user.subTitle_detail'), link: `/user/${id}/edit` },
        { category: 'charge', title: t('user.subTitle_budget'), link: `/user/${id}/charge` },
        { category: 'transaction', title: t('user.subTitle_ProcessedLog'), link: `/user/${id}/transaction` },
        { category: 'jobLog', title: t('user.subTitle_jobLog'), link: `/user/${id}/jobLog` }
    ];

    const items: { edit: ISection[], charge: ISection[] } = {
        edit: [
            {
                title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'), items: [
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
                ]
            },
            {
                title: t('user.secTitle_account_details'), description: t('comment.user_edit_account_description'), items: [
                    { name: 'balance_current', title: t('account.balance_current'), type: 'currency', defaultValue: user.balance, placeholder: t('user.placeholder_department') },
                    { name: 'restricted', title: t('account.restricted'), type: 'checked', defaultValue: user.restriced },
                ]
            },
            {
                title: t('user.secTitle_statistics'), description: t('comment.user_edit_statistics_description'), items: [
                ]
            },
            {
                title: t('user.secTitle_etc'), description: t('comment.user_edit_account_description'), items: [
                    { name: 'department', title: t('user.department'), type: 'input', defaultValue: user.department, placeholder: t('user.placeholder_department') },
                    { name: 'card_number', title: t('user.card_number'), type: 'input', defaultValue: user.card_number },
                    { name: 'card_number2', title: t('user.card_number2'), type: 'input', defaultValue: user.card_number2 },
                ]
            },
        ],
        charge: [
            {
                title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'), items: [
                    { name: 'balance_current', title: t('account.balance_current'), type: 'label', defaultValue: formatCurrency(user.balance, locale) },
                    { name: 'balance_new', title: t('account.balance_new'), type: 'currency', defaultValue: 0, locale: locale },
                    { name: 'txn_comment', title: t('common.explanation'), type: 'input', defaultValue: "" },
                ]
            },
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

    const printerUsageColumns: IColumnData[] = [
        { name: 'usage_date', title: t('printer.usage_date'), type: 'date' },
        { name: 'display_name', title: t('printer.printer') },
        { name: 'page', title: t('common.page'), align: 'center' },
        { name: 'usage_cost', title: t('printer.usage_cost'), align: 'center', type: 'currency' },
        { name: 'document_name', title: t('printer.document_name'), align: 'center' },
        { name: 'property', title: t('printer.property'), align: 'center' },
        { name: 'status', title: t('printer.status'), align: 'center' },
    ];

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('common.user'), href: '/user' },
                    {
                        label: `${t('user.edit_user')} : ${user.full_name}(${user.user_name})`,
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
            {job === 'jobLog' &&
                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    <LogTable
                        columns={printerUsageColumns}
                        rows={printerUsageInfo}
                        currentPage={0}
                        totalPages={printerUsageCount}
                        editable={false}
                    />
                </div>
            }
        </main>
    );
}