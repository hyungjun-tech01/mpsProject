import Breadcrumbs from '@/app/components/user/breadcrumbs';
import { ISection, IButtonInfo } from '@/app/components/edit-items';
import CreateForm   from '@/app/components/user/create-form';
import getDictionary from '@/app/locales/dictionaries';
// import { EditForm } from '@/app/components/user/edit-form';
// import { createUser } from '@/app/lib/actions';


export default async function Page(props: {
    params: Promise<{ id: string, job: string, locale: "ko" | "en" }> }
) {
    const params = await props.params;
    const locale = params.locale;
    const [ t ] = await Promise.all([
        getDictionary(locale),
    ]);

    // const formItems: ISection[] = [
    //     {
    //         title: t('user.secTitle_details'), description: t('comment.user_edit_details_description'), items: [
    //             { name: 'user_name', title: "ID", type: 'input', defaultValue: "" },
    //             { name: 'full_name', title: t('user.full_name'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_full_name') },
    //             { name: 'email', title: t('common.email'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_email') },
    //             { name: 'home_directory', title: t('user.home_directory'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_home_directory') },
    //             {
    //                 name: 'disabled_printing', title: t('user.enable_disable_printing'), type: 'select', defaultValue: "N", options: [
    //                     { title: t('user.enable_printing'), value: 'N' },
    //                     { title: t('user.disable_printing'), value: 'Y' }
    //                 ]
    //             },
    //             { name: 'notes', title: t('common.note'), type: 'input', defaultValue: "", placeholder: "" },
    //         ]
    //     },
    //     {
    //         title: t('user.secTitle_account_details'), description: t('comment.user_edit_account_description'), items: [
    //             { name: 'balance_current', title: t('account.balance_current'), type: 'currency', defaultValue: 0, placeholder: t('user.placeholder_balance_initial') },
    //             { name: 'restricted', title: t('account.restricted'), type: 'checked', defaultValue: false },
    //         ]
    //     },
    //     {
    //         title: t('user.secTitle_etc'), description: t('comment.user_edit_account_description'), items: [
    //             { name: 'department', title: t('user.department'), type: 'input', defaultValue: "", placeholder: t('user.placeholder_department') },
    //             { name: 'card_number', title: t('user.card_number'), type: 'input', defaultValue: "" },
    //             { name: 'card_number2', title: t('user.card_number2'), type: 'input', defaultValue: "" },
    //         ]
    //     },
    // ];
    // const buttonItems: IButtonInfo[] = [
    //     { title: t('common.cancel'), link: '/user', isButton: false },
    //     { title: t('user.create_user'), link: '', isButton: true },
    // ];

    //-----------------------------------
    const formItems = {
        sec_detail_title : t('user.secTitle_details'),
        sec_detail_description : t('comment.user_edit_details_description'),
        user_name_title: 'ID',
        user_name_placeholder: t('user.placeholder_user_name')
    }

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
            {/* <EditForm items={formItems} buttons={buttonItems} action={createUser}/> */}
            <CreateForm items={formItems} />
        </main>
    );
}