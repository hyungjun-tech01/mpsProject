import type { Pool } from "pg";


export async function fetchFilteredApplicationLog(
    client: Pool,
    query: string,
    itemsPerPage: number,
    currentPage: number,
    dateFrom :string | null,
    dateTo : string | null,
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const auditLogs =
           await client.query(`
            select application_log_id as id,
                    application_page      ,
                    application_action   ,
                    application_parameter,
                    tui.full_name||'('||tal.created_by||')' created_by   ,
                    log_date             ,
                    ip_address        
            from  tbl_application_log_info tal
            LEFT JOIN 
                tbl_user_info tui ON tal.created_by = tui.user_name
            WHERE
               (
                application_page ILIKE $3 OR
                application_action ILIKE $3 OR
                application_parameter ILIKE $3 OR
                tui.full_name ILIKE $3 
                )		
                and log_date::DATE BETWEEN TO_DATE($1, 'YYYY.MM.DD') AND TO_DATE($2, 'YYYY.MM.DD')	
            ORDER BY log_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
            `, [dateFrom, dateTo, `%${query}%`]);


        return auditLogs.rows;

    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};

export async function fetchFilteredApplicationLogPages(
    client: Pool,
    query: string,
    itemsPerPage: number,
    dateFrom :string | null,
    dateTo : string | null,
) {
    try {
        const count =
             await client.query(`
                SELECT COUNT(*) FROM tbl_application_log_info tal, tbl_user_info tui
                 WHERE  1 = 1
                   and tal.created_by = tui.user_name
                   and (
                        application_page ILIKE $3 OR
                        application_action ILIKE $3 OR
                        application_parameter ILIKE $3 OR
                        tui.full_name ILIKE $3                    
                    )
                    and log_date::DATE BETWEEN TO_DATE($1, 'YYYY.MM.DD') AND TO_DATE($2, 'YYYY.MM.DD')	
            `, [dateFrom, dateTo, `%${query}%`]);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};