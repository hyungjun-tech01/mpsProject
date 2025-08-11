import type { Pool } from "pg";

import { Device } from '@/app/lib/definitions';



export async function createDevice(
    client: Pool,
    newDevice: Record<string, string | null>
) {
    try {

        // 트랜잭션 시작
        await client.query('BEGIN');

        let ext_device_function;
        ext_device_function = newDevice.ext_device_function_printer === 'Y' ? 'COPIER' : '';
        ext_device_function += newDevice.ext_device_function_scan === 'Y' ? ',SCAN' : '';
        ext_device_function += newDevice.ext_device_function_fax === 'Y' ? ',FAX' : '';

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
        ) RETURNING *`, [newDevice.device_type, newDevice.device_name, newDevice.location,
        newDevice.physical_device_id, ext_device_function, 'N', 'N', newDevice.notes,
        newDevice.device_model, newDevice.serial_number,
        newDevice.app_type, newDevice.device_administrator, newDevice.device_administrator_password
        ]);

        const newDeviceId = result.rows[0].device_id;
        await client.query(`
            insert into tbl_group_member_info(group_id, member_id, member_type)
            values($1, $2, $3)`, [newDevice.device_group, newDeviceId, 'device']);


        // 모든 쿼리 성공 시 커밋
        await client.query('COMMIT');

        // 성공 처리
        return { result: true, data: result.rows[0] };

    } catch (error) {

        // 오류 발생 시 롤백
        await client.query('ROLLBACK');

        console.error('Insert Error:', error); // 오류 출력
        return {
            result: false,
            data: `Database Error: ${error}`,
        };
    }
}
export async function deleteDevice(
    client: Pool,
    id: string
) {
    try {
        //console.log(id);
        const result = await client.query(`
            update tbl_device_info
            set deleted ='Y'
            where device_id=$1
        `, [id]);

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

export async function deleteFaxLineInfo(
    client: Pool,
    id: string
) {
    try {
        //console.log(id);
        const result = await client.query(`
            update tbl_fax_line_info 
            set deleted_date = now()
            where fax_line_id=$1
        `, [id]);

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



export async function saveFaxLineInfo(
    client: Pool,
    saveFaxLineData:  Record<string, string | null>, 
    created_by: string) {
    try {
        //console.log('saveFaxLineData.fax_line_id,', saveFaxLineData.fax_line_id);
        // 트랜잭션 시작
        await client.query('BEGIN');

        let out_fax_line_id = null;

        if (saveFaxLineData.fax_line_id === null || saveFaxLineData.fax_line_id === '') {

            const resp_fax_line_id = await client.query(`SELECT uuid_generate_v4() fax_line_id`);
            // console.log('fax_line_id', resp_fax_line_id.rows[0].fax_line_id);

            const fax_line_id = resp_fax_line_id.rows[0].fax_line_id;

            await client.query(`
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

        } else {
            await client.query(`
                update tbl_fax_line_info 
                set fax_line_name = $1, 
                    fax_line_user_id = $2,
                    fax_line_shared_group_id = $3
                where fax_line_id = $4
            `, [saveFaxLineData.fax_line_name,
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

    } catch (error) {
        // 오류 발생 시 롤백
        await client.query('ROLLBACK');

        console.log('Modify device / Error : ', error);
        return {
            result: false,
            data: "Database Error",
        };
    };
}