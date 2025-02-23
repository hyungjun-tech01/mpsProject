'use server';

import pg from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const client = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS
});

await client.connect();

export async function deleteGroup(id: string) {
    try {
        await client.query(`
            DELETE FROM tbl_group_info WHERE group_id='${id}
        `);
    } catch (error) {
        console.log('Delete Group / Error : ', error);
        return {
            message: 'Database Error: Failed to delete group by group ID.',
        };
    }
}