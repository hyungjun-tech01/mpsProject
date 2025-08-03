import Breadcrumbs from '@/app/components/breadcrumbs';
import getDictionary from '@/app/locales/dictionaries';
import Form from '@/app/components/settings/create-form';
import { auth } from "@/auth";
import { notFound } from 'next/navigation';
import { ISection, IButtonInfo } from '@/app/components/edit-items';
import { redirect } from 'next/navigation'; // 적절한 리다이렉트 함수 import
import MyDBAdapter from '@/app/lib/adapter';


export default async function CreateRegularExprPrivateInfo(
    props: { 
        params: Promise<{ locale: "ko" | "en" }>;
    }
) {
    const params = await props.params;
    const locale = params.locale;
    const adapter = MyDBAdapter();
    const session = await auth();

    if(!session?.user) return notFound();

    ///// application log ----------------------------------------------------------------------
    const userName = session?.user.name ?? "";
    if (!userName) {
        // 여기서 redirect 함수를 사용해 리다이렉트 처리
        redirect('/login'); // '/login'으로 리다이렉트
        // notFound();
    };


    ///// application log ----------------------------------------------------------------------
    const [t] = await Promise.all([
        getDictionary(locale),
    ]);

    const formItems: ISection[] = [
        {
            title: t('settings.createRegularExprPrivateInfo'), 
            description: t('settings.createRegularExprPrivateInfoDescription'), 
            items: [       
                {
                    name: 'security_type', title: t('settings.regularExpType'), type: 'select', defaultValue: "OpenAPI", 
                    options: [
                        { title: t('settings.regularExpType_regex'), value: '정규식' },
                        { title: t('settings.regularExpType_security_word'), value: '보안 단어' }
                    ]
                },      
                { name: 'security_name', title: t('settings.regularExpName'), type: 'input', defaultValue: "", placeholder: t('settings.regularExpNamePlaceholder') },
                { name: 'security_value', title: t('settings.regularExpValue'), type: 'input', defaultValue: '', placeholder: t('settings.regularExpValuePlaceholder') },
                { name: 'created_by', title: '', type:'hidden' , defaultValue: `${userName}`, placeholder: ''}
            ]
        },
    ];

    const buttonItems: IButtonInfo = {
        cancel : { title: t('common.cancel'), link: '/settings/regularExprPrivateInfo' },
        go : { title: t('settings.create_regular') },
    };

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('settings.settings'), href: '/' },
                    { label: t('settings.regularExprPrivateInfo'), href: '/settings/regularExprPrivateInfo' },
                    {
                        label: t('settings.createRegularExprPrivateInfo'),
                        href: '/settings/regularExprPrivateInfo/create',
                        active: true,
                    },
                ]}
            />
            <Form items={formItems}  sessionUserName={userName} buttons={buttonItems} action={adapter.createRegularExp}/>
        </main>
    );
}