import Breadcrumbs from '@/app/components/breadcrumbs';
import getDictionary from '@/app/locales/dictionaries';
import Form from '@/app/components/settings/create-form';

import { ISection, IButtonInfo } from '@/app/components/edit-items';

import MyDBAdapter from '@/app/lib/adapter';

export default async function CreateRegularExprPrivateInfo(
    props: { 
        params: Promise<{ locale: "ko" | "en" }>;
    }
) {
    const params = await props.params;
    const locale = params.locale;
    const adapter = MyDBAdapter();

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
            <Form items={formItems}  buttons={buttonItems} action={adapter.createRegularExp}/>
        </main>
    );
}