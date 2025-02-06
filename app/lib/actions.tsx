'use server';

import pg from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { signIn } from '@/auth';
// import { AuthError } from 'next-auth';


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
        user_name?: string[];
        modify_user?: string[];
    };
    message?: string | null;
};

const FormSchema = z.object({
    company_name: z.string({
        invalid_type_error: 'Company name must be set',
    }),
    company_name_en: z.string(),
    amount: z.coerce.number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateCompany = FormSchema.omit({ id: true, date: true });

export async function createUser(state: State, formData: FormData) {
    const validatedFields = CreateCompany.safeParse({
        userName: formData.get('user_name'),
        userEmail: formData.get('email'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    }

    // Prepare data for insertion into the database
    const { companyName, companyNameEn, ceoName } = validatedFields.data;

    try {
        fetch()
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    revalidatePath('/user');
    redirect('/user');
}

export async function modifyUser(prevState: State, formData: FormData) {
    const validatedFields = CreateCompany.safeParse({
        userName: formData.get('user_name'),
        userEmail: formData.get('email'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    }

    // Prepare data for insertion into the database
    const { companyName, companyNameEn, ceoName } = validatedFields.data;

    try {
        fetch()
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    revalidatePath('/user');
    redirect('/user');
}

export async function deleteUser(id: string) {
    try {
        await client.query(`DELETE FROM tbl_user WHERE user_id = '${id}'`);
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete selected user.',
        };
    }

    revalidatePath('/user');
}