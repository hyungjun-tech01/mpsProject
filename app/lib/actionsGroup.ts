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


export type State = {
    errors?: {
        schedulePreiod?: string[];
        scheduleAmount?: string[];
    };
    message?: string | null;
};

const GroupFrmSchema = z.object({
    schedulePreiod: z.enum(['per_day', 'per_week', 'per_month', 'per_year'], {
        invalid_type_error: "Please select an 'Quota Period' status."
    }),
    scheduleAmount: z.coerce.number()
    .min(0, { message: 'Please enter an amount not less than 0.' }),
});

const ModifyGroup = GroupFrmSchema.omit({});

export async function modifyGroup(id: string, prevState: State, formData: FormData) {
    const validatedFields = ModifyGroup.safeParse({
        schedulePreiod: formData.get('schedulePreiod'),
        scheduleAmount: formData.get('scheduleAmount'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };

    console.log('Modify Group');
};

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