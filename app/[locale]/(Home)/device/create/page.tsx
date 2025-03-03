import Breadcrumbs from '@/app/components/breadcrumbs';
import getDictionary from '@/app/locales/dictionaries';
import Form from '@/app/components/device/create-form';
import { fetchPrinterGroup } from '@/app/lib/fetchDeviceData';
import { ISection, IButtonInfo } from '@/app/components/edit-items';
import {createDevice} from '@/app/components/device/actions';

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
                { name: 'notes', title: t('device.notes'), type: 'input', defaultValue: "", placeholder: t('device.notes') },
                { name: 'physical_device_id', title: t('device.physical_device_id'), type: 'input', defaultValue: "", placeholder: t('device.physical_device_id') },
                { name: 'device_model', title: t('device.device_model'), type: 'input', defaultValue: "", placeholder: t('device.device_model') },
                { name: 'serial_number', title: t('device.serial_number'), type: 'input', defaultValue: "", placeholder: t('device.serial_number') },   
            ]
        },
        {
            title: t('device.device_function'), 
            description: t('device.device_function'), 
            items: [             
                { name: 'ext_device_function_printer', title: t('device.ext_device_function_printer'), type: 'checked', defaultValue: "", placeholder: t('device.ext_device_function_printer') },
                { name: 'ext_device_function_scan', title: t('device.ext_device_function_scan'), type: 'checked', defaultValue: "", placeholder: t('device.ext_device_function_scan') },
                { name: 'ext_device_function_fax', title: t('device.ext_device_function_fax'), type: 'checked', defaultValue: "", placeholder: t('device.ext_device_function_fax') },
                {
                    name: 'device_group', title: t('device.printer_device_group'), type: 'select', defaultValue: "", 
                    options:  printerGroup.map((x:any) => ( {'title':x.group_name, 'value':x.group_id} ) )
                },
            ]
        },

    ];

    const buttonItems: IButtonInfo = {
        cancel : { title: t('common.cancel'), link: '/device' },
        go : { title: t('device.create_device') },
    };

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
            <Form items={formItems}  buttons={buttonItems} action={createDevice}/>
        </main>
    );
}