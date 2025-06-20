'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'
import {FaxLineInfo} from  '@/app/lib/definitions';

import MyDBAdapter from '@/app/lib/adapter';

import { notFound } from "next/navigation";
import { auth } from "@/auth"

export type State = {
    errors?: Record<string, string[]> | null;
    message?: string|null;
};

const adapter = MyDBAdapter();

//  app_type : z.string({
//    invalid_type_error: 'Please select app type',
// }),

const FormSchema = z.object({
    device_id : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    device_type : z.string({
        invalid_type_error: 'Please select device type',
    }),
    device_name : z.string({
        invalid_type_error: 'Device name is required',
    }).min(1, 'Device name is required'),
    location : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    device_administrator : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    device_administrator_password : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    notes : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    physical_device_id :z.string({
        invalid_type_error: 'Host Name or Ip address is required',
    }).min(1, 'Host Name or Ip address is required'),
    device_model : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    serial_number : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    device_status : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    ext_device_function_printer :  z.enum(["Y", "N"], {
        invalid_type_error: 'Please select Y or N',
    }),
    ext_device_function_scan :  z.enum(["Y", "N"], {
        invalid_type_error: 'Please select Y or N',
    }),
    ext_device_function_fax :  z.enum(["Y", "N"], {
        invalid_type_error: 'Please select Y or N',
    }),
    // enable_print_release :  z.enum(["Y", "N"], {
    //     invalid_type_error: 'Please select Y or N',
    // }),
    device_group  :  z.string({
        invalid_type_error: 'Printer device group is required',
    }).min(1, 'Printer device group is required'),
});

const CreateDevice = FormSchema;

export async function createDevice(prevState: State, formData: FormData) {
    

    // 체크박스 값이 없으면 "N"으로 설정
    if (!formData.has('ext_device_function_printer')) {
        formData.set('ext_device_function_printer', 'N');
    }
    if (!formData.has('ext_device_function_scan')) {
        formData.set('ext_device_function_scan', 'N');
    }
    if (!formData.has('ext_device_function_fax')) {
        formData.set('ext_device_function_fax', 'N');
    }
    // if (!formData.has('enable_print_release')) {
    //     formData.set('enable_print_release', 'N');
    // }

    const validatedFields = CreateDevice.safeParse({
        app_type: formData.get('app_type'),
        device_type: formData.get('device_type'),
        device_name: formData.get('device_name'),
        device_status: formData.get('device_status'),
        location: formData.get('location'),
        notes: formData.get('notes'),
        physical_device_id: formData.get('physical_device_id'),
        device_administrator: formData.get('device_administrator'),
        device_administrator_password: formData.get('device_administrator_password'),
        ext_device_function_printer: formData.get('ext_device_function_printer'),
        ext_device_function_scan: formData.get('ext_device_function_scan'),
        ext_device_function_fax: formData.get('ext_device_function_fax'),
        // enable_print_release: formData.get('enable_print_release'),
        device_model: formData.get('device_model'),
        serial_number: formData.get('serial_number'),
        device_group: formData.get('device_group')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        console.log('Error', validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Device.',
        };
    }

    // Prepare data for insertion into the database
    const newDevice = validatedFields.data;

    const output = await adapter.createDevice(newDevice);
    if(!output.result) {
        return {
            errors: output.data,
            message: 'Failed to Create Device',
        }
    }

    revalidatePath('/device');
    redirect('/device');
}
export async function deleteDevice(id : string) {
    const output = await adapter.deleteDevice(id);

    if(!output.result) {
        return {
            errors: output.data,
            message: 'Failed to Delete Device',
        }
    }

    revalidatePath('/device');
    redirect('/device');
}

export async function deleteFaxLineInfo(faxLineid : string, deviceId : string) {
    const output = await adapter.fetchDeleteFaxLineInfo(faxLineid);

    if(!output.result) {
        return {
            errors: output.data,
            message: 'Failed to Delete Fax Line Information',
        }
    }
    // revalidatePath를 비동기적으로 처리
    revalidatePath(`/device/${deviceId}/edit`);
}

export async function saveFaxLineInfo(saveFaxLineData: FaxLineInfo, deviceId: string){
    console.log('FaxLineInfo', saveFaxLineData);
    const session = await auth();

    if(!session?.user)
        return notFound();

    const output = await adapter.saveFaxLineInfo(saveFaxLineData, session.user.name);
    console.log('ACTIONS saveFaxLineInfo', output);
    if(!output.result) {
        return {
            errors: output.data,
            message: 'Failed to Save Fax Line Information',
        }
    }else{

        revalidatePath(`/device/${deviceId}/edit`);

        return {
            fax_line_id: output.data
        }
    }
}

export async function modifyDevice(prevState: State, formData: FormData) {

    if (!(formData instanceof FormData)) {
        console.error("Error: formData가 FormData 인스턴스가 아닙니다.");
        return;
    }

    // 체크박스 값이 없으면 "N"으로 설정
    if (!formData.has('ext_device_function_printer')) {
        formData.set('ext_device_function_printer', 'N');
    }
    if (!formData.has('ext_device_function_scan')) {
        formData.set('ext_device_function_scan', 'N');
    }
    if (!formData.has('ext_device_function_fax')) {
        formData.set('ext_device_function_fax', 'N');
    }
    // if (!formData.has('enable_print_release')) {
    //     formData.set('enable_print_release', 'N');
    // }

    const validatedFields = CreateDevice.safeParse({
        device_id : formData.get('device_id'),
        app_type: formData.get('app_type'),
        device_type: formData.get('device_type'),
        device_name: formData.get('device_name'),
        device_status: formData.get('device_status'),
        device_administrator: formData.get('device_administrator'),
        device_administrator_password: formData.get('device_administrator_password'),
        location: formData.get('location'),
        notes: formData.get('notes'),
        physical_device_id: formData.get('physical_device_id'),
        ext_device_function_printer: formData.get('ext_device_function_printer'),
        ext_device_function_scan: formData.get('ext_device_function_scan'),
        ext_device_function_fax: formData.get('ext_device_function_fax'),
        device_model: formData.get('device_model'),
        serial_number: formData.get('serial_number'),
        device_group: formData.get('device_group')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        console.log('Error', validatedFields.error.flatten().fieldErrors);
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Device.',
        };
    }

    // Prepare data for insertion into the database
    const newDevice = validatedFields.data;

    if ( newDevice.device_administrator !== null && newDevice.device_administrator_password === null){
        return {
            errors: ['Device administrator password missing'],
            message: 'Device administrator password missing',
        }
    }

    const output = await adapter.modifyDevice(newDevice);

    if(!output.result) {
        return {
            errors: [output.data],
            message: 'Failed to Modify Device',
        }
    }

    revalidatePath('/device');
    redirect('/device');
}