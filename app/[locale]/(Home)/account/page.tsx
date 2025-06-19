import { notFound } from 'next/navigation';
import { IButtonInfo, ISection } from '@/app/components/edit-items';
import { EditForm } from '@/app/components/user/edit-form';
import Breadcrumbs from '@/app/components/breadcrumbs';

import getDictionary from '@/app/locales/dictionaries';
import MyDBAdapter from '@/app/lib/adapter';
import { auth } from "@/auth"


export default async function Page(props: {
    params: Promise<{ locale: "ko" | "en" }>
}) {
    const params = await props.params;
    const locale = params.locale;

    const session = await auth();
    if(!session?.user?.name)
        return notFound();

    // console.log('[Account] current user :', session.user);
    const adapter = MyDBAdapter();
    const [t, user] = await Promise.all([
        getDictionary(locale),
        adapter.getUserByName(session.user.name)
    ]);

    // Items -------------------------------------------------------------------
    const items: ISection[] = [
        {
            title: t('user.secTitle_details'), description: "",
            items: [
                { name: 'userName', title: 'ID', type: 'label', defaultValue: user.user_name },
                { name: 'userFullName', title: t('user.full_name'), type: 'input', defaultValue: user.full_name, placeholder: t('user.placeholder_full_name') },
                { name: 'userEmail', title: t('common.email'), type: 'input', defaultValue: user.email, placeholder: t('user.placeholder_email') },
                { name: 'userDepartment', title: t('user.department'), type: 'input', defaultValue: user.department, placeholder: t('user.placeholder_department') },
                { name: 'userCardNumber', title: t('user.card_number'), type: 'input', defaultValue: user.card_number },
                { name: 'userCardNumber2', title: t('user.card_number2'), type: 'input', defaultValue: user.card_number2 },
            ]
        },
        {
            title: t('user.secTitle_password'), description: "",
            items: [
                { name: 'userPwdNew', title: t('user.password_new'), type: 'password', defaultValue: "", placeholder: t('user.placeholder_password_new') },
                { name: 'userPwdNewAgain', title: t('user.password_new_again'), type: 'password', defaultValue: "", placeholder: t('user.placeholder_password_new_again') },
            ]
        },
    ];

    const buttonItems: IButtonInfo = {
        cancel: { title: t('common.cancel'), link: '/' },
        go: { title: t('user.update_user') },
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('common.account'), href: '/account', active: true },
                ]}
            />

            <EditForm id={user.user_id} items={items} buttons={buttonItems} action={adapter.updateAccount}/>
        </main>
    );
}