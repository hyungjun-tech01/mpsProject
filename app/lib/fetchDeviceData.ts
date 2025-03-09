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
                SELECT 
                device_id id,
                device_id,
                device_name,
                location,
                notes,
                physical_device_id,
                device_model,
                serial_number,
                deleted,
                device_status,
                device_type,
                ext_device_function
                from tbl_device_info
                WHERE
                1=1 AND
                    (
                        tbl_device_info.device_name ILIKE '${`%${query}%`}' OR
                        tbl_device_info.device_model ILIKE '${`%${query}%`}' OR
                        tbl_device_info.ext_device_function ILIKE '${`%${query}%`}' OR
                        tbl_device_info.deleted ILIKE '${`%${query}%`}'
                    )
                ORDER BY tbl_device_info.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
            : await client.query(`
                SELECT 
                    device_id id,
                    device_id,
                    device_name,
                    location,
                    notes,
                    physical_device_id,
                    device_model,
                    serial_number,
                    deleted,
                    device_status,
                    device_type,
                    ext_device_function
                FROM tbl_device_info
                WHERE
                1=1
                ORDER BY tbl_device_info.modified_date DESC
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

export async function fetchDeviceById(id:string){
    try {
        const device = await client.query(`
            SELECT
                t.device_id AS id,
                t.device_id,
                t.device_name,
                t.location,
                t.notes,
                t.physical_device_id,
                t.device_model,
                t.serial_number,
                t.deleted,
                t.device_status,
                t.device_type,
                tgi.group_id, 
                tgi.group_name,
                CASE 
                    WHEN t.ext_device_function LIKE '%COPIER%' THEN 'Y' 
                    ELSE 'N' 
                END AS ext_device_function_printer,
                CASE 
                    WHEN t.ext_device_function LIKE '%SCAN%' THEN 'Y' 
                    ELSE 'N' 
                END AS ext_device_function_scan,
                CASE 
                    WHEN t.ext_device_function LIKE '%FAX%' THEN 'Y' 
                    ELSE 'N' 
                END AS ext_device_function_fax
            FROM tbl_device_info t
            LEFT JOIN tbl_group_member_info tgmi
                ON t.device_id = tgmi.member_id
            LEFT JOIN tbl_group_info tgi
                ON tgmi.group_id = tgi.group_id
            WHERE t.device_id = '${id}'
        `);

        return device.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to get device by id.");
    }
}

export async function fetchDeviceFaxLineById(id:string){
    try{
        const faxLine =  await client.query(`
        SELECT 
            tfli.fax_line_id,
            tfli.fax_line_name,
            tfli.printer_id,
            tfli.fax_line_user_id,
            tfli.fax_line_shared_group_id,
            tfli.created_date,
            tfli.created_by,
            tfli.deleted_date,
            tfli.deleted_by,
            tui.full_name||'('||tui.user_name||')' user_name,
            tgi.group_name
        from tbl_fax_line_info tfli
        LEFT JOIN tbl_user_info tui ON tfli.fax_line_user_id = tui.user_id
        LEFT JOIN tbl_group_info tgi ON tfli.fax_line_shared_group_id = tgi.group_id
        WHERE 1=1 
        AND tfli.deleted_date is null
        AND tfli.printer_id = $1
    `,[id]);
    return  faxLine.rows;
    }catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to get device by id.");
    }
}

export async function fetchCreateDevice(newDevice: any) {
    try {

        // 트랜잭션 시작
        await client.query('BEGIN');

        let ext_device_function;
        ext_device_function = newDevice.ext_device_function_printer === 'Y' ? 'COPIER':'';
        ext_device_function += newDevice.ext_device_function_scan === 'Y' ? ',SCAN':'';
        ext_device_function += newDevice.ext_device_function_fax === 'Y' ? ',FAX':'';

        ext_device_function = ext_device_function.startsWith(",") ? ext_device_function.slice(1) : ext_device_function;

        const result = await client.query(`
        INSERT INTO tbl_device_info (
          device_type, device_name, location, physical_device_id, 
          ext_device_function, deleted, web_print_enabled, notes, device_model, serial_number,
          created_date, created_by, modified_date, modified_by
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            now(), -1, now(), -1
        ) RETURNING *`, [newDevice.device_type,newDevice.device_name, newDevice.location, 
            newDevice.physical_device_id,ext_device_function,'N', 'N', newDevice.notes,
            newDevice.device_model,newDevice.serial_number
        ]);

        const newDeviceId = result.rows[0].device_id;
        const result1 = await client.query(`
        insert into tbl_group_member_info(group_id, member_id, member_type)
        values($1, $2, $3)`,[ newDevice.device_group, newDeviceId, 'device']);

       
        // 모든 쿼리 성공 시 커밋
        await client.query('COMMIT');    

        // 성공 처리
        return { result: true, data: result.rows[0] };

    } catch (error:any) {

        // 오류 발생 시 롤백
        await client.query('ROLLBACK');

        console.error('Insert Error:', error); // 오류 출력
        return {
            result: false,
            data: `Database Error: ${error.message}`,
        };
    }
}

export async function fetchPrinterGroup() {
    try {
        const response = await client.query(`
           select null group_id, null group_name
           union all
           select group_id, group_name
             from tbl_group_info
             where group_type = 'device';
        `);
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer group");
    }
};

export async function fetchDeleteDevice(id: string) {
    try {
        console.log(id);
        const result = await client.query(`
            update tbl_device_info
            set deleted ='Y'
            where device_id=$1
        `,[id]);
       
        // 성공 처리
        return { result: true, data: result.rows[0] };

    } catch (error) {
        console.log('Delete device / Error : ', error);
        return {
            result: false,
            data: "Database Error: Failed to Delete device",
        };
    };
}
export async function fetchModifyDevice(newDevice: any) {

    try {
        // 트랜잭션 시작
        await client.query('BEGIN');

        let ext_device_function;
        ext_device_function = newDevice.ext_device_function_printer === 'Y' ? 'COPIER':'';
        ext_device_function += newDevice.ext_device_function_scan === 'Y' ? ',SCAN':'';
        ext_device_function += newDevice.ext_device_function_fax === 'Y' ? ',FAX':'';

        ext_device_function = ext_device_function.startsWith(",") ? ext_device_function.slice(1) : ext_device_function;

        const result = await client.query(`
            update tbl_device_info
            set device_type = $1, device_name = $2, 
                location = $3, physical_device_id = $4, 
                device_status = $5, notes = $6,
                device_model = $7, serial_number = $8, 
                ext_device_function = $9, deleted = $10
            where device_id = $11
        `,[ newDevice.device_type, newDevice.device_name, newDevice.location, 
            newDevice.physical_device_id, 
            newDevice.device_status, newDevice.notes, 
            newDevice.device_model, newDevice.serial_number,
            ext_device_function, newDevice.deleted, 
            newDevice.device_id]);

        // tbl_group_member_info 데이터가 있으면, update 
        // tbl_group_member_info 데이터가 없으면, insert 
        const queryResult1 = await client.query(`
            select count(*) cnt from tbl_group_member_info t
            where t.member_id = $1`,[newDevice.device_id]);

        // 결과에서 카운트를 정수로 변환
        const count = parseInt(queryResult1.rows[0].cnt, 10);    

        if (count > 0) {
            const result1 = await client.query(`
            update tbl_group_member_info
               set group_id = $1
               where member_id = $2`,[ newDevice.device_group, newDevice.device_id]);
        }else{
            const result1 = await client.query(`
            insert into tbl_group_member_info(group_id, member_id, member_type)
            values($1, $2, $3)`,[ newDevice.device_group, newDevice.device_id, 'device']);
        }

        // 모든 쿼리 성공 시 커밋
        await client.query('COMMIT');

        // 성공 처리
        return { result: true, data: result.rows[0] };

    }catch (error) {
       // 오류 발생 시 롤백
       await client.query('ROLLBACK');

        console.log('Modify device / Error : ', error);
        return {
            result: false,
            data: "Database Error",
        };
    };
}