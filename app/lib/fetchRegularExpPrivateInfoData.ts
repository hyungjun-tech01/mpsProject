import type { Pool } from "pg";


/*================= tbl_printer_usage_log =======================*/
export async function getFilteredRegularExp(
    client: Pool,
    query : string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const response = await client.query(`
            SELECT security_value_id ,
            security_name            , 
            security_type            ,
            security_word            ,
            created_by               ,
            creation_date         
            FROM tbl_security_value_info 
            WHERE ( security_name like '%'||${query}||'%' or security_word like '%'||${query}||'%' )
            ORDER BY creation_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `);
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch tbl_security_value_info.");
    }
};
