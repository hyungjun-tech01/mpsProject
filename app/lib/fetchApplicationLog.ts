import type { Pool } from "pg";


export async function fetchFilteredApplicationLog(
    client: Pool,
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const auditLogs =
           await client.query(`
            select application_log_id   id,
                    application_page      ,
                    application_action   ,
                    application_parameter,
                    tui.full_name||'('||tal.created_by||')' created_by   ,
                    log_date             ,
                    ip_address        
            from tbl_application_log_info tal, tbl_user_info tui
            WHERE 1 = 1
              and tal.created_by = tui.user_name
             and (
                application_page ILIKE '${`%${query}%`}' OR
                application_action ILIKE '${`%${query}%`}' OR
                application_parameter ILIKE '${`%${query}%`}' OR
                tui.full_name ILIKE '${`%${query}%`}' 
                )			
            ORDER BY log_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
            `);


        return auditLogs.rows;

    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};

// export async function fetchFilteredAuditLogPages(
//     client: Pool,
//     query: string,
//     itemsPerPage: number
// ) {
//     try {
//         const count =
//             query !== ""
//                 ? await client.query(`
//                 SELECT COUNT(*) FROM tbl_audit_job_log
//                  WHERE 
//                     (
//                         printer_serial_number ILIKE '${`%${query}%`}' OR
//                         user_name ILIKE '${`%${query}%`}' OR
//                         document_name ILIKE '${`%${query}%`}' OR
//                         privacy_text ILIKE '${`%${query}%`}'                        
//                     )
//             `)
//                 : await client.query(`
//                 SELECT COUNT(*) FROM tbl_audit_job_log
//             `);

//         const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
//         return totalPages;
//     } catch (error) {
//         console.error("Database Error:", error);
//         throw new Error("Failed to fetch audit logs");
//     }
// };