import Breadcrumbs from '@/app/components/user/breadcrumbs';
import getDictionary from '@/app/locales/dictionaries';
import Form from '@/app/components/device/create-form';
import { fetchPrinterGroup } from '@/app/lib/fetchDeviceData';
import { ISection, IButtonInfo } from '@/app/components/edit-items';

export default async function CreateDevice(
    props: { 
        params: Promise<{ locale: "ko" | "en" }>;
    }
) {
    const params = await props.params;
    const locale = params.locale;

    const [t, printerGroup] = await Promise.all([
        getDictionary(locale),
        fetchPrinterGroup,
    ]);

    const formItems: ISection[] = [
        {
            title: t('device.create_device'), 
            description: t('device.create_description'), 
            items: [             
                { name: 'device_type', title: t('device.device_type'), type: 'input', defaultValue: "", placeholder: (t('device.device_type')) },
                { name: 'device_name', title: t('device.device_name'), type: 'input', defaultValue: "", placeholder: t('device.device_name') },
                { name: 'location', title: t('device.location'), type: 'input', defaultValue: "", placeholder: t('device.location') }
            ]
        }
    ];

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('device.device'), href: '/device' },
                    {
                        label: 'Create Device',
                        href: '/device/create',
                        active: true,
                    },
                ]}
            />
            <Form items={formItems}/>
        </main>
    );
}