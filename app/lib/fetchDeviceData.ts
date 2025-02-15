"use server";

import pg from 'pg';
import { BASE_PATH } from '@/constans';
import { Device } from '@/app/lib/definitions';
import { revalidatePath } from 'next/cache';

const client = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS
});

await client.connect();

export async function fetchFilteredDevices(
    query: string,
    itemsPerPage: number,
    currentPage: number,
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const device = query !== '' 
            ? await client.query(`
                SELECT printer_id id, 
                printer_id
                ,server_name
                ,printer_name
                ,display_name
                ,location
                ,notes
                ,charge_type
                ,default_cost
                ,deleted
                ,deleted_date
                ,disabled
                ,disabled_until
                ,total_jobs
                ,total_pages
                ,total_sheets
                ,reset_by
                ,reset_date
                ,created_date
                ,created_by
                ,modified_date
                ,modified_by
                ,color_detection_mode
                ,device_type
                ,ext_device_function
                ,physical_printer_id
                ,printer_type
                ,serial_number
                ,web_print_enabled
                ,custom1
                ,custom2
                ,custom3
                ,custom4
                ,custom5
                ,custom6
                ,last_usage_date
                ,gcp_printer_id
                ,gcp_enabled
                ,modified_ticks
                ,server_uuid
                ,parent_id FROM tbl_printer_info
                WHERE
                1=1 AND
                    (
                        tbl_printer_info.display_name ILIKE '${`%${query}%`}' OR
                        tbl_printer_info.device_type ILIKE '${`%${query}%`}' OR
                        tbl_printer_info.ext_device_function ILIKE '${`%${query}%`}' OR
                        tbl_printer_info.server_name ILIKE '${`%${query}%`}' OR 
                        tbl_printer_info.deleted ILIKE '${`%${query}%`}'
                    )
                ORDER BY tbl_printer_info.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
            : await client.query(`
                SELECT printer_id id, 
                printer_id
                ,server_name
                ,printer_name
                ,display_name
                ,location
                ,notes
                ,charge_type
                ,default_cost
                ,deleted
                ,deleted_date
                ,disabled
                ,disabled_until
                ,total_jobs
                ,total_pages
                ,total_sheets
                ,reset_by
                ,reset_date
                ,created_date
                ,created_by
                ,modified_date
                ,modified_by
                ,color_detection_mode
                ,device_type
                ,ext_device_function
                ,physical_printer_id
                ,printer_type
                ,serial_number
                ,web_print_enabled
                ,custom1
                ,custom2
                ,custom3
                ,custom4
                ,custom5
                ,custom6
                ,last_usage_date
                ,gcp_printer_id
                ,gcp_enabled
                ,modified_ticks
                ,server_uuid
                ,parent_id FROM tbl_printer_info
                WHERE
                1=1
                ORDER BY tbl_printer_info.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
        ;
        
        const converted = device.rows.map((data:Device) => ({
            ...data,
        }));
        return converted;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch device.');
    }
}

export async function fetchDevicesPages(
    query: string,
    itemsPerPage: number,
) {
    try {
        const count = query !== '' 
            ? await client.query(`
                SELECT COUNT(*)
                FROM tbl_printer_info
                WHERE
                1=1 AND
                (
                    tbl_printer_info.display_name ILIKE '${`%${query}%`}' OR
                    tbl_printer_info.device_type ILIKE '${`%${query}%`}' OR
                    tbl_printer_info.ext_device_function ILIKE '${`%${query}%`}' OR
                    tbl_printer_info.server_name ILIKE '${`%${query}%`}'                    )
                `)
            : await client.query(`
                SELECT COUNT(*)
                FROM tbl_printer_info
            `)
        ;

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchCreateDevice(newDevice: any) {
    try {

        let ext_device_function;
        ext_device_function = newDevice.ext_device_function_printer === 'Y' ? 'COPIER':'';
        ext_device_function += newDevice.ext_device_function_scan === 'Y' ? ',SCAN':'';
        ext_device_function += newDevice.ext_device_function_fax === 'Y' ? ',FAX':'';

        ext_device_function = ext_device_function.startsWith(",") ? ext_device_function.slice(1) : ext_device_function;

         // 값 배열로 변환
        const inputData = [
        newDevice.device_type,
        newDevice.device_name,
        newDevice.location ?? null, // undefined를 null로 변환
        newDevice.physical_printer_ip,
        ext_device_function
      ];

        const query = `
        INSERT INTO tbl_printer_info (
          device_type, printer_name, location, physical_printer_id, 
          ext_device_function, deleted, created_date, created_by, modified_date, modified_by
        ) VALUES (
            $1, $2, $3, $4, $5, 'N', now(), -1, now(), -1
        )`;

        const result = await client.query(query, inputData);
       
        // 성공 처리
        return { result: true, data: result.rows[0] };

    } catch (error) {
        return {
            result: false,
            data: "Database Error: Failed to Create device",
        };
    }
}

export async function fetchPrinterGroup() {
    try {
        const response = await client.query(`
           select null printer_group_id, null group_name, null display_name
           union all
           select printer_group_id, group_name, display_name
             from tbl_printer_group;
        `);
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer group");
    }
};

export async function deleteDevice(id: string) {
    try {
        console.log(id);
        const result = await client.query(`
            update tbl_printer_info
            set deleted ='Y'
            where printer_id=$1
        `,[id]);
       
        // 성공 처리
        revalidatePath('/device');
        return { result: true, data: result.rows[0] };

    } catch (error) {
        revalidatePath('/device');
        console.log('Delete device / Error : ', error);
        return {
            result: false,
            data: "Database Error: Failed to Delete device",
        };
    };
}