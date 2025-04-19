import type { Pool } from "pg";


export async function fetchFilteredPrintSpool(
    client: Pool,
    userName: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const users = await client.query(`
            SELECT
                print_job_id id,
                print_pc_ip,
                print_job_time,
                print_job_user,
                print_document_name,
                copies,
                color_mode,
                paper_size,
                duplex,
                n_up,
                language,
                pages
            FROM tbl_print_job_info
            WHERE
                print_job_user='${userName}'
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `);
        return users.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users.");
    }
};

export async function fetchFilteredPrintSpoolPages(
    client: Pool,
    userName: string,
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
            SELECT
                COUNT(*)
            FROM tbl_print_job_info
            WHERE
                print_job_user='${userName}'
        `);
        return Math.ceil(Number(count.rows[0].count) / itemsPerPage);
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users.");
    }
};