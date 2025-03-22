import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/breadcrumbs';
import LogTable from '@/app/components/table';

import getDictionary from '@/app/locales/dictionaries';
import { changeBalance, modifyUser } from '@/app/lib/actions';
import { IColumnData, ISearch } from '@/app/lib/definitions';
import {
    fetchUserById,
    fetchPrinterUsageLogByUserId,
    fetchPrinterUsageLogPagesByUserId
} from '@/app/lib/fetchData';
import { formatCurrency } from "@/app/lib/utils";


export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ id: string, job: string, locale: "ko" | "en" }>
}) {
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

    const [printerUsageInfo, printerUsageCount] = await Promise.all([
        fetchPrinterUsageLogByUserId(id, itemsPerPage, currentPage),
        fetchPrinterUsageLogPagesByUserId(id, itemsPerPage)
    ]);

    // Manipluate Process --------------------------------------------------------
    const balanceLink = <Link
            href={`/user/${id}/charge`}
            className='ml-4 text-sm text-lime-700'
        >{t('user.change_balance')}
        </Link>

    // Items -------------------------------------------------------------------
    const subTitles = [
        { category: 'edit', title: t('user.subTitle_detail'), link: `/user/${id}/edit` },
        { category: 'charge', title: t('user.subTitle_budget'), link: `/user/${id}/charge` },
        { category: 'jobLog', title: t('user.subTitle_jobLog'), link: `/user/${id}/jobLog` }
    ];

    const items: { edit: ISection[], charge: ISection[] } = {
        edit: [
            {
                title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'),
                items: [
                    { name: 'userName', title: 'ID', type: 'label', defaultValue: user.user_name },
                    { name: 'userFullName', title: t('user.full_name'), type: 'input', defaultValue: user.full_name, placeholder: t('user.placeholder_full_name') },
                    { name: 'userEmail', title: t('common.email'), type: 'input', defaultValue: user.email, placeholder: t('user.placeholder_email') },
                    { name: 'userHomeDirectory', title: t('user.home_directory'), type: 'input', defaultValue: user.home_directory, placeholder: t('user.placeholder_home_directory') },
                    {
                        name: 'userDisabledPrinting', title: t('user.enable_disable_printing'), type: 'select', defaultValue: user.disabled_printing, options: [
                            { title: t('user.enable_printing'), value: 'N' },
                            { title: t('user.disable_printing'), value: 'Y' }
                        ]
                    },
                ]
            },
            {
                title: t('user.secTitle_account_details'), description: t('comment.user_edit_account_description'),
                items: [
                    { name: 'userBalanceCurrent', title: t('account.balance_current'), type: 'label', defaultValue: formatCurrency(user.balance, locale), placeholder: t('user.placeholder_department'), other: balanceLink },
                    { name: 'userRestricted', title: t('account.restricted'), type: 'checked', defaultValue: user.restricted },
                ]
            },
            {
                title: t('user.secTitle_etc'), description: t('comment.user_edit_account_description'),
                items: [
                    { name: 'userDepartment', title: t('user.department'), type: 'input', defaultValue: user.department, placeholder: t('user.placeholder_department') },
                    { name: 'userCardNumber', title: t('user.card_number'), type: 'input', defaultValue: user.card_number },
                    { name: 'userCardNumber2', title: t('user.card_number2'), type: 'input', defaultValue: user.card_number2 },
                ]
            },
        ],
        charge: [
            {
                title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'),
                items: [
                    { name: 'balanceCurrent', title: t('account.balance_current'), type: 'label', defaultValue: formatCurrency(user.balance, locale) },
                    { name: 'balanceNew', title: t('account.balance_new'), type: 'currency', defaultValue: user.balance, locale: locale },
                    { name: 'txnComment', title: t('common.explanation'), type: 'input', defaultValue: "" },
                ]
            },
        ],
    };

    const printerUsageColumns: IColumnData[] = [
        { name: 'usage_date', title: t('printer.usage_date') },
        { name: 'display_name', title: t('printer.printer') },
        { name: 'pages', title: t('common.page'), align: 'center' },
        { name: 'color_total_pages', title: t('common.color_total_pages'), align: 'center' },
        { name: 'black_total_pages', title: t('common.black_total_pages'), align: 'center' },
        { name: 'document_name', title: t('printer.document_name'), align: 'center' },
        { name: 'status', title: t('printer.status'), align: 'center' },
    ];

    const buttonItems: { edit: IButtonInfo, charge: IButtonInfo } = {
        edit: {
            cancel: { title: t('common.cancel'), link: '/user' },
            go: { title: t('user.update_user') },
        },
        charge: {
            cancel: { title: t('common.cancel'), link: '/user' },
            go: { title: t('common.apply') },
        }
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
            {job === 'edit' && <EditForm id={id} items={items[job]} buttons={buttonItems[job]} action={modifyUser}/>}
            {job === 'charge' && <EditForm id={id} items={items[job]} buttons={buttonItems[job]} action={changeBalance}/>}
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