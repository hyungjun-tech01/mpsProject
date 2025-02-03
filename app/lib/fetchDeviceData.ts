import pg from 'pg';
import { BASE_PATH } from '@/constans';
import { User } from '@/app/lib/definitions';


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
        const users = query !== '' 
            ? await client.query(`
                SELECT * FROM tbl_printer
                WHERE
                1=1 AND
                    (
                        tbl_printer.display_name ILIKE '${`%${query}%`}' OR
                        tbl_printer.device_type ILIKE '${`%${query}%`}' OR
                        tbl_printer.ext_device_function ILIKE '${`%${query}%`}' OR
                        tbl_printer.server_name ILIKE '${`%${query}%`}' OR 
                        tbl_printer.deleted ILIKE '${`%${query}%`}'
                    )
                ORDER BY tbl_printer.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
            : await client.query(`
                SELECT * FROM tbl_printer
                WHERE
                1=1
                ORDER BY tbl_printer.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
        ;
        
        const converted = users.rows.map((data:User) => ({
            ...data,
            id: data.user_id,
        }));
        return converted;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
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
                FROM tbl_printer
                WHERE
                1=1 AND
                (
                        tbl_printer.display_name ILIKE '${`%${query}%`}' OR
                        tbl_printer.device_type ILIKE '${`%${query}%`}' OR
                        tbl_printer.ext_device_function ILIKE '${`%${query}%`}' OR
                        tbl_printer.server_name ILIKE '${`%${query}%`}'                    )
                `)
            : await client.query(`
                SELECT COUNT(*)
                FROM tbl_printer
                WHERE
                tbl_printer.deleted='N'
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
        console.log("create user", newDevice);

        let ext_device_function;
        ext_device_function = newDevice.ext_device_function_printer === 'Y' ? 'COPIER':'';
        ext_device_function += newDevice.ext_device_function_scan === 'Y' ? ',SCAN':'';
        ext_device_function += newDevice.ext_device_function_fax === 'Y' ? ',FAX':'';

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
          ext_device_function
        ) VALUES (
            $1, $2, $3, $4, $5
        ) RETURNING *;
      `;
  
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