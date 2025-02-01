import Breadcrumbs from '@/app/components/user/breadcrumbs';
import getDictionary from '@/app/locales/dictionaries';
import Form from '@/app/components/device/create-form';

export default async function CreateDevice(
    props: { 
        params: Promise<{ locale: "ko" | "en" }>;
    }
) {
    const params = await props.params;
    const locale = params.locale;

    const [t] = await Promise.all([
        getDictionary(locale),
    ]);
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('device.device'), href: '/device' },
                    {
                        label: 'Create User',
                        href: '/user/create',
                        active: true,
                    },
                ]}
            />
            <Form />
        </main>
    );
}