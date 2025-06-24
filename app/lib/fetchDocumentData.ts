import type { Pool } from "pg";


// ----- Begin : Documnet -------------------------------------------------------//
export async function fetchFilteredDocumnets(
    client: Pool,
    query: string,
    userName: string,
    isAdmin: boolean,
    jobType: 'fax' | 'scan',
    itemsPerPage: number,
    currentPage: number
) {

    console.log('fetchFilteredDocumnets user_name', userName);

    const offset = (currentPage - 1) * itemsPerPage;
    try{
        const docs = await client.query(`
            SELECT
                dj.document_id id,
                tui.user_name||'/'||tui.full_name created_by,
                dj.created_date,
                dj.document_name name,
                tdi.device_name||'/'||tdi.location device_name,
                dj.total_pages,
                dj.total_pages,
                dj.archive_path,
                dj.archive_path thumbnail,
                dj.shared
            FROM tbl_document_job_info dj, tbl_device_info tdi, tbl_user_info tui
            WHERE dj.printer_id = tdi.device_id
                and dj.created_by = tui.user_id
                and dj.job_type = '${jobType.toUpperCase()}' AND dj.deleted_date is NULL
                ${isAdmin? "" : "AND ( tui.user_name = '" + userName
                    + "' OR dj.document_id IN ( SELECT document_id FROM tbl_document_shared_info tdsi, tbl_user_info t  WHERE tdsi.shared_to = t.user_id and t.user_name ='"
                    + userName + "'))"}
                ${query !== "" ? "AND (dj.document_name ILIKE '%" + query + "%' OR dj.archive_path ILIKE '%" + query + "%')" : ""}
            ORDER BY dj.created_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}`);

            // return docs.rows;
            const converted = docs.rows.map((data) => ({
                ...data,
                deletable: (data.created_by.includes(userName)) || isAdmin
            }));
            return converted;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch documents.");
    }
};

export async function fetchFilteredDocumnetPages(
    client: Pool,
    query: string,
    user_id: string,
    isAdmin: boolean,
    job_type: 'fax' | 'scan',
    itemsPerPage: number
) {
    try{
        const count = await client.query(`
            SELECT
                COUNT(*)
            FROM tbl_document_job_info dj
            WHERE
                dj.job_type = '${job_type.toUpperCase()}'
                ${user_id === 'admin' ? "" : "AND ( dj.created_by = '" + user_id
                    + "' OR dj.document_id IN ( SELECT document_id FROM tbl_document_shared_info  WHERE shared_to = '"
                    + user_id + "'))"}
                ${query !== "" ? "AND (dj.document_name ILIKE '%" + query + "%' OR dj.archive_path ILIKE '%" + query + "%')" : ""}
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch depts not in group.");
    }
};