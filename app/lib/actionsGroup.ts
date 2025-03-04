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
        scheduleStart?: string[];
        scheduleStartSub: string[];
        scheduleAmount?: string[];
    };
    message?: string | null;
};

const GroupFormSchema = z.object({
    groupID: z.string(),
    groupName: z.string(),
    groupNotes: z.string(),
    schedulePeriod: z.enum(['NONE','PER_DAY','PER_WEEK', 'PER_MONTH', 'PER_YEAR'], {
        invalid_type_error: "Please select an 'Quota Period' status."
    }),
    scheduleStart: z.coerce.number().min(1, { message: 'Wrong Value'}),
    scheduleStartSub: z.coerce.number().min(1, { message: 'Wrong Value'}),
    scheduleAmount: z.coerce.number().min(0, { message: 'Please enter an amount not less than 0.' }),
});

const CreateGroup = GroupFormSchema.omit({groupID:true});

export async function createGroup(prevState: State, formData: FormData) {
    const validatedFields = CreateGroup.safeParse({
        groupName: formData.get('group_name'),
        groupNote: formData.get('group_notes'),
        schedulePeriod: formData.get('schedule_preiod'),
        scheduleStart: formData.get('schedule_start'),
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

const ModifyGroup = GroupFormSchema.omit({});

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