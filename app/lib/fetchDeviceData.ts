import type { Pool } from "pg";

import { Device } from '@/app/lib/definitions';
import { encrypt } from '@/app/lib/cryptoFunc';


export async function fetchFilteredDevices(
    client: Pool,
    query: string,
    itemsPerPage: number,
    currentPage: number,
    groupId?: string
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const device = query !== '' ? 
        await client.query(`
            SELECT
                d.device_id AS id,
                d.device_id,
                d.device_name,
                d.location,
                d.notes,
                d.physical_device_id,
                d.device_model,
                d.serial_number,
                d.deleted,
                d.device_status,
                d.device_type,
                d.app_type,
                d.ext_device_function,
                d.cyan_toner_percentage,
                d.magenta_toner_percentage,
                d.yellow_toner_percentage,
                d.black_toner_percentage,
                CASE 
                    WHEN d.device_type = 'color_printer' THEN 'Color_Printer01.png'
                    WHEN d.device_type = 'mono_printer' THEN 'Black_Printer01.png'
                    WHEN d.device_type = 'mono_mfd' THEN 'Black_MFD01.png'
                    ELSE 'Color_MFD01.png'
                END AS device_type_img
            FROM tbl_device_info d
            ${!!groupId ? "INNER JOIN tbl_group_member_info gm ON d.device_id = gm.member_id" : ""}
            WHERE 1=1 
            AND ( d.device_name ILIKE '${`%${query}%`}' OR 
                d.device_model ILIKE '${`%${query}%`}' OR 
                d.ext_device_function ILIKE '${`%${query}%`}' OR 
                d.physical_device_id ILIKE '${`%${query}%`}' OR 
                d.location ILIKE '${`%${query}%`}' 
                )
            AND deleted = 'N'
            ${!!groupId ? "AND gm.group_id = '" + groupId + "'" : ""}
            ORDER BY d.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `) :
        await client.query(`
            SELECT
                d.device_id AS id,
                d.device_id,
                d.device_name,
                d.location,
                d.notes,
                d.physical_device_id,
                d.device_model,
                d.serial_number,
                d.deleted,
                d.device_status,
                d.device_type,
                d.app_type,
                d.ext_device_function,
                d.cyan_toner_percentage,
                d.magenta_toner_percentage,
                d.yellow_toner_percentage,
                d.black_toner_percentage,
                CASE 
                    WHEN d.device_type = 'color_printer' THEN 'Color_Printer01.png'
                    WHEN d.device_type = 'mono_printer' THEN 'Black_Printer01.png'
                    WHEN d.device_type = 'mono_mfd' THEN 'Black_MFD01.png'
                    ELSE 'Color_MFD01.png'
                END AS device_type_img
            FROM tbl_device_info d
            ${!!groupId ? "INNER JOIN tbl_group_member_info gm ON d.device_id = gm.member_id" : ""}
            WHERE 1=1 
            AND deleted = 'N'
            ${!!groupId ? "AND gm.group_id = '" + groupId + "'" : ""}
            ORDER BY d.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `)
        ;
        
        const converted = device.rows.map((data:Device) => ({
            ...data,
            cyan_toner_percentage: data.cyan_toner_percentage + ' %',
            magenta_toner_percentage: data.magenta_toner_percentage + ' %',
            yellow_toner_percentage: data.yellow_toner_percentage + ' %',
            black_toner_percentage: data.black_toner_percentage + ' %',
        }));
        return converted;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch devices.');
    }
}

// export async function fetchFilteredDevices(
//     loginName: string | undefined,
//     query: string,
//     itemsPerPage: number,
//     currentPage: number,
//     groupId?: string
// ) {
    
// }

export async function fetchDevicesPages(
    client: Pool,
    query: string,
    itemsPerPage: number,
) {

    try {
        await client.query('SELECT 1');
    } catch (error) {
        throw new Error('Database connection failed: ' + error.message);
    }

    try {
        const count = query !== '' 
            ? await client.query(`
                SELECT COUNT(*)
                FROM tbl_device_info
                WHERE
                1=1 AND
                (
                    tbl_device_info.device_name ILIKE '${`%${query}%`}' OR
                    tbl_device_info.device_type ILIKE '${`%${query}%`}' OR
                    tbl_device_info.ext_device_function ILIKE '${`%${query}%`}' OR
                    tbl_device_info.physical_device_id ILIKE '${`%${query}%`}' OR
                    tbl_device_info.location ILIKE '${`%${query}%`}' 
                )
                AND deleted = 'N'
                `)
            : await client.query(`
                SELECT COUNT(*)
                FROM tbl_device_info
                where deleted = 'N'
            `)
        ;

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of devices.');
    }
}

export async function fetchDeviceById(
    client: Pool,
    id:string
    ){
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
                t.app_type,
                t.device_administrator,
                t.black_toner_percentage,
                t.cyan_toner_percentage,
                t.magenta_toner_percentage,
                t.yellow_toner_percentage,
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

export async function fetchDeviceFaxLineById(
    client: Pool,
    id:string
    ){
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

export async function fetchCreateDevice(
    client: Pool,
    newDevice: any
    ) {
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
          created_date, created_by, modified_date, modified_by,
          app_type, device_administrator, device_administrator_password,
          black_toner_percentage, cyan_toner_percentage, magenta_toner_percentage, yellow_toner_percentage  
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            now(), -1, now(), -1,
            $11, $12, $13,
            0,0,0,0
        ) RETURNING *`, [newDevice.device_type,newDevice.device_name, newDevice.location, 
            newDevice.physical_device_id,ext_device_function,'N', 'N', newDevice.notes,
            newDevice.device_model,newDevice.serial_number,
            newDevice.app_type, newDevice.device_administrator, newDevice.device_administrator_password 
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

export async function fetchPrinterGroup(
    client: Pool,
) {
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

export async function fetchDeleteDevice(
    client: Pool,
    id: string
    ) {
    try {
        //console.log(id);
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

export async function fetchDeleteFaxLineInfo(
    client: Pool,
    id: string
    ) {
    try {
        //console.log(id);
        const result = await client.query(`
            update tbl_fax_line_info 
            set deleted_date = now()
            where fax_line_id=$1
        `,[id]);
       
        // 성공 처리
        return { result: true, data: result.rows[0] };

    } catch (error) {
        console.log('Delete device / Error : ', error);
        return {
            result: false,
            data: "Database Error: Failed to Delete fax line information",
        };
    };
}


export async function fetchModifyDevice(
    client: Pool,
    newDevice: any
    ) {

    try {
        // 트랜잭션 시작
        await client.query('BEGIN');

        let ext_device_function;
        ext_device_function = newDevice.ext_device_function_printer === 'Y' ? 'COPIER':'';
        ext_device_function += newDevice.ext_device_function_scan === 'Y' ? ',SCAN':'';
        ext_device_function += newDevice.ext_device_function_fax === 'Y' ? ',FAX':'';

        ext_device_function = ext_device_function.startsWith(",") ? ext_device_function.slice(1) : ext_device_function;
        const encrypt_device_admin_pwd = encrypt(newDevice.device_administrator_password);

        const result = await client.query(`
            update tbl_device_info
            set device_type = $1, 
                device_name = $2, 
                location = $3, 
                physical_device_id = $4, 
                notes = $5,
                device_model = $6, 
                serial_number = $7, 
                ext_device_function = $8, 
                deleted = $9,
                device_administrator = $10,
                device_administrator_password = $11
            where device_id = $12
        `,[ newDevice.device_type, 
            newDevice.device_name, 
            newDevice.location, 
            newDevice.physical_device_id, 
            newDevice.notes, 
            newDevice.device_model, 
            newDevice.serial_number,
            ext_device_function, 
            newDevice.deleted, 
            newDevice.device_administrator,
            encrypt_device_admin_pwd,
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

export async function fetchSaveFaxLineInfo(
    client: Pool,
    saveFaxLineData:any, 
    created_by:any){
    try {
        //console.log('saveFaxLineData.fax_line_id,', saveFaxLineData.fax_line_id);
        // 트랜잭션 시작
        await client.query('BEGIN');

        let result ;
        let out_fax_line_id = null;

        if (saveFaxLineData.fax_line_id === null || saveFaxLineData.fax_line_id  === ''){

            const resp_fax_line_id = await client.query(`SELECT uuid_generate_v4() fax_line_id`);
            console.log('fax_line_id', resp_fax_line_id.rows[0].fax_line_id);

            const fax_line_id = resp_fax_line_id.rows[0].fax_line_id;

            result = await client.query(`
            insert into tbl_fax_line_info(fax_line_id, 
                                        fax_line_name, 
                                        printer_id, 
                                        fax_line_user_id, 
                                        fax_line_shared_group_id, 
                                        created_date,
                                        created_by)
            values($1,$2,$3,$4,$5, now(),$6)`,
            [fax_line_id,
            saveFaxLineData.fax_line_name, 
            saveFaxLineData.printer_id,
            saveFaxLineData.fax_line_user_id, 
            saveFaxLineData.fax_line_shared_group_id,
            created_by
            ]);

            out_fax_line_id = fax_line_id;

        }else{
            result = await client.query(`
                update tbl_fax_line_info 
                set fax_line_name = $1, 
                    fax_line_user_id = $2,
                    fax_line_shared_group_id = $3
                where fax_line_id = $4
            `,[saveFaxLineData.fax_line_name, 
               saveFaxLineData.fax_line_user_id, 
               saveFaxLineData.fax_line_shared_group_id,
               saveFaxLineData.fax_line_id
            ]);
            out_fax_line_id = saveFaxLineData.fax_line_id;
        }

        
        // 모든 쿼리 성공 시 커밋
        await client.query('COMMIT');

        console.log('fetchdevice_out_fax_line_id', out_fax_line_id);

        // 성공 처리
        return { result: true, data: out_fax_line_id };

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

export async function fetchDevicesbyGroupManagerPages(
    client: Pool,
    userId: string,
    query: string,
    itemsPerPage: number,
) {
    try {
        const count = 
        query !== "" ? 
        await client.query(`
            SELECT DISTINCT
                COUNT(*)
            FROM tbl_device_info d
            INNER JOIN tbl_group_member_info gm_device ON d.device_id = gm_device.member_id
            INNER JOIN tbl_group_member_info gm_user ON gm_device.group_id = gm_user.group_id
            WHERE gm_user.member_id = '${userId}'
            AND (tbl_device_info.device_name ILIKE '${`%${query}%`}' OR 
                'tbl_device_info.device_type ILIKE '${`%${query}%`}' OR 
                'tbl_device_info.ext_device_function ILIKE '${`%${query}%`}' OR 
                'tbl_device_info.physical_device_id ILIKE ILIKE '${`%${query}%`}'
                )
            AND d.deleted = 'N'`) 
        : await client.query(`
            SELECT DISTINCT
                COUNT(*)
            FROM tbl_device_info d
            INNER JOIN tbl_group_member_info gm_device ON d.device_id = gm_device.member_id
            INNER JOIN tbl_group_member_info gm_user ON gm_device.group_id = gm_user.group_id
            WHERE gm_user.member_id = '${userId}'
            AND d.deleted = 'N'
        `)
        ;
        return Math.ceil(Number(count.rows[0].count) / itemsPerPage);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of devices.');
    }
}

export async function fetchDevicesbyGroupManager(
    client: Pool,
    userId: string,
    query: string,
    itemsPerPage: number,
    currentPage: number,
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const devices = 
        query !== "" ?
        await client.query(`
            SELECT DISTINCT
                d.device_id AS id,
                d.device_name,
                d.location,
                d.notes,
                d.physical_device_id,
                d.device_model,
                d.serial_number,
                d.deleted,
                d.device_status,
                d.device_type,
                d.app_type,
                d.ext_device_function,
                d.cyan_toner_percentage,
                d.magenta_toner_percentage,
                d.yellow_toner_percentage,
                d.black_toner_percentage,
                d.modified_date,
                CASE 
                    WHEN d.device_type = 'color_printer' THEN 'Color_Printer01.png'
                    WHEN d.device_type = 'mono_printer' THEN 'Black_Printer01.png'
                    WHEN d.device_type = 'mono_mfd' THEN 'Black_MFD01.png'
                    ELSE 'Color_MFD01.png'
                END AS device_type_img
            FROM tbl_device_info d
            INNER JOIN tbl_group_member_info gm_device ON d.device_id = gm_device.member_id
            INNER JOIN tbl_group_member_info gm_user ON gm_device.group_id = gm_user.group_id
            WHERE gm_user.member_id = '${userId}'
            AND (tbl_device_info.device_name ILIKE  '${`%${query}%`}'  OR 
                 tbl_device_info.device_type ILIKE  '${`%${query}%`}'  OR
                 tbl_device_info.ext_device_function ILIKE '${`%${query}%`}'  OR 
                 tbl_device_info.physical_device_id ILIKE ILIKE  '${`%${query}%`}' )
            AND d.deleted = 'N'
            ORDER BY d.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `)
         : await client.query(`
            SELECT DISTINCT
                d.device_id AS id,
                d.device_name,
                d.location,
                d.notes,
                d.physical_device_id,
                d.device_model,
                d.serial_number,
                d.deleted,
                d.device_status,
                d.device_type,
                d.app_type,
                d.ext_device_function,
                d.cyan_toner_percentage,
                d.magenta_toner_percentage,
                d.yellow_toner_percentage,
                d.black_toner_percentage,
                d.modified_date,
                CASE 
                    WHEN d.device_type = 'color_printer' THEN 'Color_Printer01.png'
                    WHEN d.device_type = 'mono_printer' THEN 'Black_Printer01.png'
                    WHEN d.device_type = 'mono_mfd' THEN 'Black_MFD01.png'
                    ELSE 'Color_MFD01.png'
                END AS device_type_img
            FROM tbl_device_info d
            INNER JOIN tbl_group_member_info gm_device ON d.device_id = gm_device.member_id
            INNER JOIN tbl_group_member_info gm_user ON gm_device.group_id = gm_user.group_id
            WHERE gm_user.member_id = '${userId}'
            AND d.deleted = 'N'
            ORDER BY d.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
        ;

        return devices.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of devices.');
    }
}