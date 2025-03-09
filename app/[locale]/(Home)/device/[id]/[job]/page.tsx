import { IColumnData, ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';

import {
    fetchDeviceById,
    fetchPrinterGroup,
    fetchDeviceFaxLineById
} from '@/app/lib/fetchDeviceData';

import {
    fetchAllUsers, fetchAllUserGroup
} from '@/app/lib/fetchData';


import Breadcrumbs from '@/app/components/breadcrumbs';
import Form  from '@/app/components/device/create-form';
import FormFax from '@/app/components/device/create-form-fax';
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

    const [t, device, printerGroup, fax, allUsers, allGroups] = await Promise.all([
        getDictionary(locale),
        fetchDeviceById(id),
        fetchPrinterGroup(),
        fetchDeviceFaxLineById(id),
        fetchAllUsers(),
        fetchAllUserGroup(),
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
                { name: 'device_status', title: t('device.device_status'), type: 'input', defaultValue: device.device_status, placeholder: t('device.device_status') },
                { name: 'notes', title: t('device.notes'), type: 'input', defaultValue: device.notes, placeholder: t('device.notes') },
                { name: 'device_model', title: t('device.device_model'), type: 'input', defaultValue: device.device_model, placeholder: t('device.device_model') },
                { name: 'serial_number', title: t('device.serial_number'), type: 'input', defaultValue: device.serial_number, placeholder: t('device.serial_number') },
            ]
        },
        {
            title: t('device.device_function'), 
            description: t('device.device_function'), 
            items: [             
                { name: 'ext_device_function_printer', title: t('device.ext_device_function_printer'), type: 'checked', defaultValue: device.ext_device_function_printer, placeholder: t('device.ext_device_function_printer') },
                { name: 'ext_device_function_scan', title: t('device.ext_device_function_scan'), type: 'checked', defaultValue: device.ext_device_function_scan, placeholder: t('device.ext_device_function_scan') },
                { name: 'ext_device_function_fax', title: t('device.ext_device_function_fax'), type: 'checked', defaultValue: device.ext_device_function_fax, placeholder: t('device.ext_device_function_fax') },
                { name: 'deleted', title: t('device.deleted'), type: 'checked', defaultValue: device.deleted, placeholder: t('device.deleted') },
                {
                    name: 'device_group', title: t('device.printer_device_group'), type: 'select', defaultValue: device.group_id, 
                    options:  printerGroup.map((x:any) => ( {'title':x.group_name, 'value':x.group_id} ) )
                },
            ]
        },
       
    ];

    const optionsUser = allUsers.map((x:any) => ( 
            {'label':`${x.user_name}`, 'value':String(x.user_id)} 
            ) 
        );
    const optionsGroup = allGroups.map((x:any) => ( 
        {'label':`${x.group_name}`, 'value':String(x.group_id)} 
        ) 
    );


    const editFaxItems: ISection[] =  fax.length > 0 
    ? fax.map((faxLine, index) => ({
        title: `${t('fax.fax_line')}`, // 여러 개일 경우 번호 추가
        description: t('fax.fax_line_desc'),
        items: [
            { name: `fax_line_id_${index}`, title: `${t('fax.fax_line_id')} ${index+1}` , type: 'hidden', defaultValue: faxLine.fax_line_id, placeholder: t('fax.fax_line_id') },
            { name: `fax_line_name_${index}`, title: `${t('fax.fax_line_name')} ${index+1}` , type: 'input', defaultValue: faxLine.fax_line_name, placeholder: t('fax.fax_line_name') },
            {
                name: `fax_line_user_id_${index}`, title:  t('fax.fax_line_user'), type: 'react-select', defaultValue: {value:faxLine.fax_line_user_id, label:faxLine.user_name}, 
                options: optionsUser
            },
            { 
                name: `fax_line_shared_group_id_${index}`, title: t('fax.fax_line_shared_group'), type: 'react-select', defaultValue: {value:faxLine.group_id, label:faxLine.group_name}, placeholder: t('fax.fax_line_shared_group') ,
                options: optionsGroup
            },
            { name: `space_line_${index}`, title: '', type: 'input', defaultValue: '', placeholder: '' },
        ]
    }))
    : [{ title: t('fax.fax_line'), description: t('fax.fax_line_desc'), items: [] }];

    const buttonItems = {
            cancel: { title: t('common.cancel'), link: '/device' },
            go: { title: t('device.udpate_device') },
    };

    const buttonFaxItems = {
        save: { title: t('fax.save') },
        add: { title: t('fax.add') },
        delete: { title: t('fax.delete') },
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
             { fax && job === 'edit' && editFaxItems.length > 0 && (
                <FormFax id={id} 
                    items={editFaxItems} 
                    optionsUser = {optionsUser} 
                    optionsGroup ={optionsGroup}
                    buttons={buttonFaxItems}  
                    action={modifyDevice}/>
              )}
        </main>
    );
}