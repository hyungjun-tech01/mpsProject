import Breadcrumbs from '@/app/components/breadcrumbs';
import getDictionary from '@/app/locales/dictionaries';
import Form from '@/app/components/device/create-form';

import { ISection, IButtonInfo } from '@/app/components/edit-items';
import {createDevice} from '@/app/components/device/actions';
import MyDBAdapter from '@/app/lib/adapter';


export default async function CreateDevice(
    props: { 
        params: Promise<{ locale: "ko" | "en" }>;
    }
) {
    const params = await props.params;
    const locale = params.locale;
    const adapter = MyDBAdapter();

    const [t, printerGroup] = await Promise.all([
        getDictionary(locale),
        adapter.getPrinterGroup(),
    ]);

    const formItems: ISection[] = [
        {
            title: t('device.create_device'), 
            description: t('device.create_description'), 
            items: [       
                {
                    name: 'app_type', title: t('device.app_type'), type: 'select', defaultValue: "OpenAPI", 
                    options: [
                        { title: t('device.open_api'), value: 'OpenAPI' },
                        { title: t('device.workpath_sdk'), value: 'Workpath SDK' }
                    ]
                },      
                { name: 'device_name', title: t('device.device_name'), type: 'input', defaultValue: "", placeholder: t('device.device_name') },
                {
                    name: 'device_type', title: t('device.device_type'), type: 'select', defaultValue: "OpenAPI", 
                    options: [
                        { title: t('device.color_mfd'), value: 'color_mfd' },
                        { title: t('device.mono_mfd'), value: 'mono_mfd' },
                        { title: t('device.color_printer'), value: 'color_printer' },
                        { title: t('device.mono_printer'), value: 'mono_printer' },
                    ]
                },
                { name: 'device_administrator', title: t('device.device_administrator'), type: 'input', defaultValue: '', placeholder: t('device.device_administrator') },
                { name: 'device_administrator_password', title: t('device.device_administrator_password'), type: 'password', defaultValue: '', placeholder: t('device.device_administrator_password') },                
                { name: 'location', title: t('device.location'), type: 'input', defaultValue: "", placeholder: t('device.location') },
                { name: 'physical_device_id', title: t('device.physical_device_id'), type: 'input', defaultValue: '', placeholder: t('device.physical_device_id') },
                { name: 'notes', title: t('device.notes'), type: 'input', defaultValue: "", placeholder: t('device.notes') },
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
                    options: [{title: '-- 그룹 선택 --', value: '' }, 
                        ...printerGroup.map((x:{group_name:string, group_id:string}) =>
                            ({title:x.group_name, value:x.group_id}))]
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