import type { Metadata } from "next";
import getDictionary from '@/app/locales/dictionaries';
import MyDBAdapter from '@/app/lib/adapter';
import { IColumnData } from '@/app/lib/definitions';
import Search from '@/app/components/search';
import { CreateButton } from '@/app/components/buttons';
import Table from '@/app/components/table';
import { deleteDevice } from '@/app/components/device/actions';
import { notFound } from "next/navigation";
import { auth } from "@/auth"
import { AdminPanelSettings, Circle } from "@mui/icons-material";
import ModalButton from '@/app/components/device/modalButton';


export const metadata: Metadata = {
    title: 'Device',
}

interface ISearchDevice {
    query?: string;
    itemsPerPage?: string;
    page?: string;
    groupId?:string;
    groupPage?:string;
}


export default async function Device(
    props: { 
        searchParams?: Promise<ISearchDevice>;
        params: Promise<{ locale: "ko" | "en" }>;
    }
){
    const params = await props.params;
    const locale = params.locale;

    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const itemsPerPage = Number(searchParams?.itemsPerPage) || 10;
    const currentPage = Number(searchParams?.page) || 1;
    const currentGroupPage = Number(searchParams?.groupPage) || 1;
    const groupId = searchParams?.groupId;

    const session = await auth();
    console.log('Session :', session);
    
    if(!session?.user)
        return notFound();

    const isAdmin = session?.user.role === 'admin';
    const userId = session?.user.id;

    const adapter = MyDBAdapter();
    const [t, totalPages, devices, deviceGroup] = await Promise.all([
        getDictionary(locale),
        isAdmin ? adapter.getDevicesPages(query, itemsPerPage)
            : adapter.getDevicesbyGroupManagerPages(userId, query, itemsPerPage),
        isAdmin ? adapter.getFilteredDevices(query, itemsPerPage, currentPage, groupId)
            : adapter.getDevicesbyGroupManager(userId, query, itemsPerPage, currentPage),
        isAdmin ? adapter.getFilteredGroups("", "device", itemsPerPage, currentGroupPage, locale) : null
    ]);

    //console.log('Check : ', devices);

    const columns: IColumnData[] = [
        { name: 'device_type_img', title: t('device.device_type'), align: 'center' , type:'icon'},
        { name: 'device_name', title: t('device.printer_name'), type: 'edit' },
        { name: 'physical_device_id', title: t('device.physical_device_id'), align: 'center', type: 'edit' },
        { name: 'cyan_toner_percentage', title: <Circle className="text-cyan-300"/>, align: 'center'},
        { name: 'magenta_toner_percentage', title: <Circle className="text-pink-300"/>, align: 'center'},
        { name: 'yellow_toner_percentage', title: <Circle className="text-yellow-300"/>, align: 'center'},
        { name: 'black_toner_percentage', title: <Circle className="text-white"/>, align: 'center'},
        { name: 'device_status', title: t('device.device_status'), align: 'center' },
        { name: 'location', title: t('device.location'), align: 'center' },
        { name: 'device_model', title: t('device.device_model'), align: 'center' },
        { name: 'serial_number', title: t('device.serial_number'), align: 'center' },
        { name: 'app_type', title: t('device.app_type'), align: 'center' },
    ];
    return (
            <div className="w-full">
                <div className="flex w-full items-center justify-between">
                    <h1 className="text-2xl">{t('device.device')}</h1>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
                    {!!deviceGroup && <ModalButton list={deviceGroup} modalId={groupId} />}
                    <Search placeholder={t("comment.search_devices")} />
                    <CreateButton link="/device/create" title={t("device.create_device")} />
                </div>
                <Table
                    columns={columns}
                    rows={devices}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    locale={locale}
                    path='device'
                    deleteAction={deleteDevice}
                    editable={false}
                />  
            </div>
    );
}
