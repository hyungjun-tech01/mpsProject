import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/user/breadcrumbs';
import LogTable from '@/app/components/table';

import getDictionary from '@/app/locales/dictionaries';
import { modifyUser } from '@/app/lib/actions';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import { generateStrOf30Days } from '@/app/lib/utils';
import {
    fetchUserById,
    fetchTransactionsByAccountId,
    fetchTransactionsPagesByAccountId,
    fetchPrinterUsageLogByUserId,
    fetchPrinterUsageLogPagesByUserId
} from '@/app/lib/fetchData';
import { formatCurrency } from "@/app/lib/utils";


export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ id: string, job: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const id = params.id;
    const job = params.job;
    const locale = params.locale;
    const searchParams = await props.searchParams;
    // const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
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
        fetchTransactionsByAccountId(user.account_id, itemsPerPage, currentPage),
        fetchTransactionsPagesByAccountId(user.account_id, itemsPerPage),
        fetchPrinterUsageLogByUserId(id, itemsPerPage, currentPage),
        fetchPrinterUsageLogPagesByUserId(id, itemsPerPage)
    ]);

    const subTitles = [
        { category: 'edit', title: t('user.subTitle_detail'), link: `/user/${id}/edit` },
        { category: 'charge', title: t('user.subTitle_budget'), link: `/user/${id}/charge` },
        { category: 'transaction', title: t('user.subTitle_ProcessedLog'), link: `/user/${id}/transaction` },
        { category: 'jobLog', title: t('user.subTitle_jobLog'), link: `/user/${id}/jobLog` }
    ];

    let maxVal = 0;
    let prevVal = 0;
    const dataFromDB = transactionInfo.map(
        (item: { transaction_date: Date, amount: number, balance: number }) => {
            const before_value = item.balance - item.amount;
            if (maxVal < item.balance) maxVal = item.balance;
            if (maxVal < before_value) maxVal = before_value;
            return {
                transaction_date: item.transaction_date,
                transaction_date_str: item.transaction_date.toISOString().split('T')[0],
                before_val: before_value,
                after_val: item.balance
            };
        }
    ).sort(function (a, b) {
        if (a.transaction_date > b.transaction_date) {
            return 1;
        }
        if (a.transaction_date < b.transaction_date) {
            return -1;
        }
        // a must be equal to b
        return 0;
    });

    if (dataFromDB.length > 0) {
        prevVal = dataFromDB.at(0).before_val;
    };

    const str30days = generateStrOf30Days();
    const xlabels = str30days.map((str, idx) => idx % 5 === 0 ? str : "");
    const tempData: { day: string, value: number }[] = [];

    for (let i = 0; i < dataFromDB.length; i++) {
        const dataStr = dataFromDB.at(i).transaction_date_str;
        const foundIdx = str30days.findIndex(item => item === dataStr);
        if (foundIdx !== -1) {
            const nextVal = dataFromDB.at(i).after_val;
            const foundIdx1 = tempData.findIndex(item => item.day === dataStr);
            if (foundIdx1 === -1) {
                tempData.push({ day: dataStr, value: nextVal });
            } else {
                tempData[foundIdx1] = { day: dataStr, value: nextVal };
            };
        }
    };

    const ydata = str30days.map(day => {
        const foundIdx = tempData.findIndex(item => item.day === day);
        if (foundIdx !== -1) {
            prevVal = tempData.at(foundIdx).value;
        }
        return prevVal;
    });

    const chartData = {
        title: 'Valance Record',
        xlabels: xlabels,
        ydata: ydata,
        maxY: maxVal,
    };

    const items: { edit: ISection[], charge: ISection[] } = {
        edit: [
            {
                title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'), items: [
                    { name: 'user_name', title: 'ID', type: 'label', defaultValue: user.user_name },
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
                    { name: 'restricted', title: t('account.restricted'), type: 'checked', defaultValue: user.restricted },
                ]
            },
            {
                title: t('user.secTitle_statistics'), description: t('comment.user_edit_statistics_description'), items: [
                    { name: 'balance_chart', title: 'Blance Record', type: 'chart', defaultValue: "", chartData: chartData }
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
        { name: 'balance', title: t('account.balance'), align: 'center', type: 'currency' },
        { name: 'transaction_type', title: t('account.transaction_type'), align: 'center' },
        { name: 'txn_comment', title: t('common.explanation'), align: 'center' },
    ];

    const printerUsageColumns: IColumnData[] = [
        { name: 'usage_date', title: t('printer.usage_date'), type: 'date' },
        { name: 'display_name', title: t('printer.printer') },
        { name: 'page', title: t('common.page'), align: 'center' },
        { name: 'usage_cost', title: t('printer.usage_cost'), align: 'center', type: 'currency' },
        { name: 'document_name', title: t('printer.document_name'), align: 'center' },
        { name: 'property', title: t('printer.property'), align: 'center', type: 'list' },
        { name: 'status', title: t('printer.status'), align: 'center', type: 'list' },
    ];

    const buttonItems: { edit: IButtonInfo[], charge: IButtonInfo[] } = {
        edit: [
            { title: t('common.cancel'), link: '/user', isButton: false },
            { title: t('user.update_user'), link: '', isButton: true },
        ],
        charge: [
            { title: t('common.cancel'), link: '/user', isButton: false },
            { title: t('common.apply'), link: '', isButton: true },
        ]
    };

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
            {(job === 'edit' || job === 'charge') && <EditForm items={items[job]} buttons={buttonItems[job]} action={modifyUser}/>}
            {job === 'transaction' &&
                <div className="rounded-md bg-gray-50 p-4 md:p-6">
                    <LogTable
                        columns={transactionColumns}
                        rows={transactionInfo}
                        currentPage={currentPage}
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
                        currentPage={currentPage}
                        totalPages={printerUsageCount}
                        editable={false}
                    />
                </div>
            }
        </main>
    );
}