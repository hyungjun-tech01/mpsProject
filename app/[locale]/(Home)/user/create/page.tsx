import Breadcrumbs from '@/app/components/breadcrumbs';
import { ISection, IButtonInfo } from '@/app/components/edit-items';
import getDictionary from '@/app/locales/dictionaries';
import { CreateForm } from '@/app/components/user/create-form';
import MyDBAdapter from '@/app/lib/adapter';
import { notFound } from 'next/navigation';
import { auth } from "@/auth";
import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import


export default async function Page(props: {
    params: Promise<{ id: string, job: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const locale = params.locale;
    const adapter = MyDBAdapter();
    const [t, allDept] = await Promise.all([
        getDictionary(locale),
        adapter.getAllDepts()
    ]);
    const session = await auth();

    if (!session?.user) return notFound();

    ///// application log ----------------------------------------------------------------------
    const userName = session?.user.name ?? "";
    if (!userName) {
        // 여기서 redirect 함수를 사용해 리다이렉트 처리
        redirect('/login'); // '/login'으로 리다이렉트
        // notFound();
    };

    const formItems: ISection[] = [
        {
            title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'), items: [
                { name: 'userName', title: "ID", type: 'input', defaultValue: "", placeholder: (t('user.placeholder_user_name')) },
                { name: 'userFullName', title: t('user.full_name'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_full_name') },
                { name: 'userEmail', title: t('common.email'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_email') },
                { name: 'userHomeDirectory', title: t('user.home_directory'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_home_directory') },
                {
                    name: 'userDisabledPrinting', title: t('user.enable_disable_printing'), type: 'select', defaultValue: "N", options: [
                        { label: t('user.enable_printing'), value: 'N' },
                        { label: t('user.disable_printing'), value: 'Y' }
                    ]
                },
                { name: 'userNotes', title: t('common.note'), type: 'input', defaultValue: "", placeholder: "" },
            ]
        },
        {
            title: t('user.secTitle_account_details'), description: t('comment.user_edit_account_description'), items: [
                { name: 'userBalanceCurrent', title: t('account.balance_current'), type: 'currency', defaultValue: 0, placeholder: t('user.placeholder_balance_initial') },
                //  { name: 'userRestricted', title: t('account.restricted'), type: 'checked', defaultValue: "N" },
            ]
        },
        {
            title: t('user.secTitle_etc'), description: t('comment.user_edit_account_description'), items: [
                {
                    name: 'userDepartment', title: t('user.department'), type: 'select', defaultValue: "", placeholder: t('user.placeholder_department'),
                    options: [{ label: t('user.select_dept'), value: "" }, ...allDept.map((x: { dept_id: string, dept_name: string }) => ({ label: x.dept_name, value: x.dept_id }))]
                },
                { name: 'userCardNumber', title: t('user.card_number'), type: 'input', defaultValue: "" },
                { name: 'userCardNumber2', title: t('user.card_number2'), type: 'input', defaultValue: "" },
            ]
        },
    ];
    const buttonItems: IButtonInfo = {
        cancel: { title: t('common.cancel'), link: '/user' },
        go: { title: t('user.create_user') },
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('common.user'), href: '/user' },
                    {
                        label: t('user.create_user'),
                        href: '/user/create',
                        active: true,
                    },
                ]}
            />
            <CreateForm items={formItems} buttons={buttonItems} sessionUserName={userName} action={adapter.createUser} />
            {/* <CreateForm items={formItems} /> */}
        </main>
    );
}