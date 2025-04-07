import Link from 'next/link';
import { notFound } from 'next/navigation';
import clsx from 'clsx';

import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/breadcrumbs';

import getDictionary from '@/app/locales/dictionaries';
import { modifyUser } from '@/app/lib/actions';
import {
    fetchUserByName,
} from '@/app/lib/fetchData';
import { auth } from "@/auth"


export default async function Page(props: {
    params: Promise<{ locale: "ko" | "en" }>
}) {
    const params = await props.params;
    const locale = params.locale;

    const session = await auth();
    if(!session?.user)
        return notFound();

    console.log('[Account] current user :', session.user)

    const [t, user] = await Promise.all([
        getDictionary(locale),
        fetchUserByName(session.user.name)
    ]);

    const id = '0001'; //임시
    
    // Items -------------------------------------------------------------------
    const items: ISection[] = [
        {
            title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'),
            items: [
                { name: 'userName', title: 'ID', type: 'label', defaultValue: user.user_name },
                { name: 'userFullName', title: t('user.full_name'), type: 'input', defaultValue: user.full_name, placeholder: t('user.placeholder_full_name') },
                { name: 'userEmail', title: t('common.email'), type: 'input', defaultValue: user.email, placeholder: t('user.placeholder_email') },
                { name: 'userHomeDirectory', title: t('user.home_directory'), type: 'input', defaultValue: user.home_directory, placeholder: t('user.placeholder_home_directory') },
            ]
        },
        {
            title: t('user.secTitle_account_details'), description: t('comment.user_edit_account_description'),
            items: [
                { name: 'userPwdNew', title: t('user.password'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_password_new') },
                { name: 'userPwdNewAgain', title: t('user.password_again'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_password_new_again') },
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