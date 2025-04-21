'use server';

import type { Pool } from 'pg';
import { revalidatePath } from 'next/cache';


export async function deleteSelected(client: Pool, list: string[]) {
    await client.query("BEGIN");
    try {
        await client.query(`
            DELETE FROM tbl_print_spool_info 
            WHERE print_job_id = ANY($1)
        `, [list]);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        console.log('Delete User / Error : ', error);
        return {
            message: 'Database Error: Failed to get account by user ID.',
        };
    }
    revalidatePath('/print');
}

export async function printSelected(client: Pool, list: string[]) {

    // 우선 선택한 print_job을 출력하는 동작

    // 이후, 해당 print_job을 db에서 삭제하는 동작
    try {
        await client.query(`
            DELETE FROM tbl_print_spool_info 
            WHERE print_job_id = ANY($1)
        `, [list]);
    } catch (error) {
        await client.query("ROLLBACK");
        console.log('Delete User / Error : ', error);
        return {
            message: 'Database Error: Failed to get account by user ID.',
        };
    }
    revalidatePath('/print');
}