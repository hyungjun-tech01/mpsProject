import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';

import {
    fetchDeviceById,
    fetchPrinterGroup,
} from '@/app/lib/fetchDeviceData';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Form  from '@/app/components/device/create-form';
import {modifyDevice} from '@/app/components/device/actions';
import { IButtonInfo, ISection } from '@/app/components/edit-items';


export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ id: string, job: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const id = params.id;
    const job = params.job;
    const locale = params.locale;
    const searchParams = await props.searchParams;

    const [t, device, printerGroup] = await Promise.all([
        getDictionary(locale),
        fetchDeviceById(id),
        fetchPrinterGroup(),
    ]);

    const editItems: ISection[] = [
        {
            title: t('device.edit_device'), 
            description: t('device.edit_description'), 
            items: [
                { name: 'device_id', title: t('device.device_id'), type: 'hidden', defaultValue: device.device_id, placeholder: t('device.device_id') },             
                {
                    name: 'device_type', title: t('device.device_type'), type: 'select', defaultValue: device.device_type, options: [
                        { title: t('device.open_api'), value: 'OpenAPI' },
                        { title: t('device.workpath_sdk'), value: 'Workpath SDK' }
                    ]
                },
                { name: 'device_name', title: t('device.device_name'), type: 'input', defaultValue: device.device_name, placeholder: t('device.device_name') },
                { name: 'location', title: t('device.location'), type: 'input', defaultValue: device.location, placeholder: t('device.location') },
                { name: 'physical_device_id', title: t('device.physical_device_id'), type: 'input', defaultValue: device.physical_device_id, placeholder: t('device.physical_device_id') },
            ]
        },
        {
            title: t('device.device_function'), 
            description: t('device.device_function'), 
            items: [             
                { name: 'ext_device_function_printer', title: t('device.ext_device_function_printer'), type: 'checked', defaultValue: device.ext_device_function_printer, placeholder: t('device.ext_device_function_printer') },
                { name: 'ext_device_function_scan', title: t('device.ext_device_function_scan'), type: 'checked', defaultValue: device.ext_device_function_scan, placeholder: t('device.ext_device_function_scan') },
                { name: 'ext_device_function_fax', title: t('device.ext_device_function_fax'), type: 'checked', defaultValue: device.ext_device_function_fax, placeholder: t('device.ext_device_function_fax') },
                { name: 'enable_print_release', title: t('device.enable_print_release'), type: 'checked', defaultValue: "", placeholder: t('device.enable_print_release') },
                {
                    name: 'printer_device_group', title: t('device.printer_device_group'), type: 'select', defaultValue: "", 
                    options:  printerGroup.map((x:any) => ( {'title':x.group_name, 'value':x.printer_group_id} ) )
                },
            ]
        },

    ];
    const buttonItems = {
            cancel: { title: t('common.cancel'), link: '/device' },
            go: { title: t('device.udpate_device') },
    };
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: t('device.device'), href: '/device' },
                    {
                        label: `${t('device.edit_device')} : ${device.device_name}`,
                        href: `/device/${id}/${job}`,
                        active: true,
                    },
                ]}
            />
             {job === 'edit' && <Form id={id} items={editItems} buttons={buttonItems} action={modifyDevice}/>}
        </main>
    );
}