import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/breadcrumbs';

import getDictionary from '@/app/locales/dictionaries';
import { modifyUser } from '@/app/lib/actions';
import {
    fetchUserById,
} from '@/app/lib/fetchData';
import { formatCurrency } from "@/app/lib/utils";
import { auth } from "@/auth"


export default async function Page(props: {
    params: Promise<{ locale: "ko" | "en" }>
}) {
    const params = await props.params;
    const locale = params.locale;

    const session = await auth();
    if(!session?.user)
        return notFound();

    const [t, user] = await Promise.all([
        getDictionary(locale),
        fetchUserById(session.user)
    ]);
    
    // Items -------------------------------------------------------------------
    const items: ISection[] = [
        {
            title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'),
            items: [
                { name: 'userName', title: 'ID', type: 'input', defaultValue: user.user_name },
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
    ];

    
    const buttonItems: IButtonInfo = {
        cancel: { title: t('common.cancel'), link: '/user' },
        go: { title: t('user.update_user') },
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('common.user'), href: '/user', active: true },
                ]}
            />

            <EditForm id={id} items={items} buttons={buttonItems} action={modifyUser}/>
        </main>
    );
}