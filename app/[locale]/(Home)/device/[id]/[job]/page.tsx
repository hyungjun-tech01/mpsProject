import { ISearch } from '@/app/lib/definitions';
import getDictionary from '@/app/locales/dictionaries';

import MyDBAdapter from '@/app/lib/adapter';
import Breadcrumbs from '@/app/components/breadcrumbs';
import Form  from '@/app/components/device/create-form';
import FormFax from '@/app/components/device/create-form-fax';
import {modifyDevice} from '@/app/components/device/actions';
import { ISection, IItem } from '@/app/components/edit-items';



export default async function Page(props: {
    searchParams?: Promise<ISearch>;
    params: Promise<{ id: string, job: string, locale: "ko" | "en" }>
}
) {
    const params = await props.params;
    const id = params.id;
    const job = params.job;
    const locale = params.locale;

    const adapter = MyDBAdapter();
    const [t, device, printerGroup, fax, allUsers, allGroups] = await Promise.all([
        getDictionary(locale),
        adapter.getDeviceById(id),
        adapter.getPrinterGroup(),
        adapter.getDeviceFaxLineById(id),
        adapter.getAllUsers(),
        adapter.getGroupsByType('user'),
    ]);

    const editItems: ISection[] = [
        {
            title: t('device.edit_device'), 
            description: t('device.edit_description'), 
            items: [
                { name: 'device_id', title: t('device.device_id'), type: 'hidden', defaultValue: device.device_id, placeholder: t('device.device_id') },             
                {
                    name: ' ', title: t('device.app_type'), type: 'select', defaultValue: device.app_type, 
                    options: [
                        { title: t('device.open_api'), value: 'OpenAPI' },
                        { title: t('device.workpath_sdk'), value: 'Workpath SDK' }
                    ]
                },
                { name: 'device_name', title: t('device.device_name'), type: 'input', defaultValue: device.device_name, placeholder: t('device.device_name') },
                { name: 'device_type', title: t('device.device_type'), type: 'select', defaultValue: device.device_type, 
                    options: [
                        { title: t('device.color_mfd'), value: 'color_mfd' },
                        { title: t('device.mono_mfd'), value: 'mono_mfd' },
                        { title: t('device.color_printer'), value: 'color_printer' },
                        { title: t('device.mono_printer'), value: 'mono_printer' },
                    ]
                },
                { name: 'device_administrator', title: t('device.device_administrator'), type: 'input', defaultValue: device.device_administrator, placeholder: t('device.device_administrator') },
                { name: 'device_administrator_password', title: t('device.device_administrator_password'), type: 'password', defaultValue: '', placeholder: t('device.device_administrator_password') },
                { name: 'location', title: t('device.location'), type: 'input', defaultValue: device.location, placeholder: t('device.location') },
                { name: 'physical_device_id', title: t('device.physical_device_id'), type: 'input', defaultValue: device.physical_device_id, placeholder: t('device.physical_device_id') },
                { name: 'device_status', title: t('device.device_status'), type: 'label', defaultValue: device.device_status, placeholder: t('device.device_status') },
                { name: 'notes', title: t('device.notes'), type: 'input', defaultValue: device.notes, placeholder: t('device.notes') },
                { name: 'device_model', title: t('device.device_model'), type: 'input', defaultValue: device.device_model, placeholder: t('device.device_model') },
                { name: 'serial_number', title: t('device.serial_number'), type: 'input', defaultValue: device.serial_number, placeholder: t('device.serial_number') },
                { name: 'toner_status', title: t('device.toner_status'), type: 'status_bar', defaultValue: "",
                    options: [ {title: 'Black', value: device.black_toner_percentage, suffix: 'h-full rounded-full bg-black' },
                        {title: 'Cyan', value: device.cyan_toner_percentage, suffix: 'h-full rounded-full bg-cyan-300' },
                        {title: 'Magenta', value: device.magenta_toner_percentage, suffix: 'h-full rounded-full bg-pink-300' },
                        {title: 'Yellow', value: device.yellow_toner_percentage, suffix: 'h-full rounded-full bg-yellow-300' }
                    ]
                },
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
                    options: [{title: '-1 없음', value: '' }, 
                        ...printerGroup.map((x:{group_name:string, group_id:string}) =>
                            ({title:x.group_name, value:x.group_id}))]
                },
            ]
        },
    ];

    const optionsUser = [
        {label:'-1 없음', value: ''},
        ...allUsers.map((x:{user_id:string, user_name:string}) => ( 
            {'label':`${x.user_name}`, 'value':String(x.user_id)} 
        ))
    ];
    const optionsGroup = [
        {label:'-1 없음', value: ''},
        ...allGroups.map((x:{group_id:string, group_name:string}) => ( 
        {'label':`${x.group_name}`, 'value':String(x.group_id)} 
        ))
    ];


    const editFaxItems: IItem[] =  fax.length > 0 
    ? fax.map((faxLine:{fax_line_id:string, fax_line_name:string, fax_line_user_id:string, user_name:string, group_id:string, group_name:string }, index:number) => ({
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
            { name: `button_${index}`, title: t('fax.save') , type: 'button', defaultValue: '', placeholder: '' },
            { name: `space_line_${index}`, title: '', type: 'input', defaultValue: '', placeholder: '' },
        ]
    }))
    : [ ];

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
             { fax && job === 'edit' && editFaxItems.length >= 0 && (
                <FormFax id={id} 
                    title = { `${t('fax.fax_line')}` }
                    description = { t('fax.fax_line_desc') }
                    items={editFaxItems} 
                    optionsUser = {optionsUser} 
                    optionsGroup ={optionsGroup}
                    buttons={buttonFaxItems}  
                    action={modifyDevice}/>
              )}
        </main>
    );
}