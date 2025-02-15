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
        fetchPrinterGroup(),
    ]);


    const formItems: ISection[] = [
        {
            title: t('device.create_device'), 
            description: t('device.create_description'), 
            items: [             
                {
                    name: 'device_type', title: t('device.device_type'), type: 'select', defaultValue: "OpenAPI", options: [
                        { title: t('device.open_api'), value: 'OpenAPI' },
                        { title: t('device.workpath_sdk'), value: 'Workpath SDK' }
                    ]
                },
                { name: 'device_name', title: t('device.device_name'), type: 'input', defaultValue: "", placeholder: t('device.device_name') },
                { name: 'location', title: t('device.location'), type: 'input', defaultValue: "", placeholder: t('device.location') },
                { name: 'physical_printer_ip', title: t('device.physical_printer_ip'), type: 'input', defaultValue: "", placeholder: t('device.physical_printer_ip') },
                { name: 'device_administrator_name', title: t('device.device_administrator_name'), type: 'input', defaultValue: "", placeholder: t('device.device_administrator_name') },
                { name: 'device_administrator_password', title: t('device.device_administrator_password'), type: 'password', defaultValue: "", placeholder: t('device.device_administrator_password') },
                
            ]
        },
        {
            title: t('device.device_function'), 
            description: t('device.device_function'), 
            items: [             
                { name: 'ext_device_function_printer', title: t('device.ext_device_function_printer'), type: 'checked', defaultValue: "", placeholder: t('device.ext_device_function_printer') },
                { name: 'ext_device_function_scan', title: t('device.ext_device_function_scan'), type: 'checked', defaultValue: "", placeholder: t('device.ext_device_function_scan') },
                { name: 'ext_device_function_fax', title: t('device.ext_device_function_fax'), type: 'checked', defaultValue: "", placeholder: t('device.ext_device_function_fax') },
                { name: 'enable_print_release', title: t('device.enable_print_release'), type: 'checked', defaultValue: "", placeholder: t('device.enable_print_release') },
                {
                    name: 'printer_device_group', title: t('device.printer_device_group'), type: 'select', defaultValue: "", 
                    options:  printerGroup.map((x:any) => ( {'title':x.group_name, 'value':x.printer_group_id} ) )
                },
            ]
        },

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