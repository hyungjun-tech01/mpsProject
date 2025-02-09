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
        userName?: string[];
        disabled_printing?: string[];
        balance_current?: string[];
    };
    message?: string | null;
};

const UserFormSchema = z.object({
    userName: z.string({
        invalid_type_error: 'User ID must be set',
    }),
    // full_name: z.string(),
    // email: z.string(),
    // home_directory: z.string(),
    // notes: z.string(),
    // disabled_printing: z.enum(['N', 'Y'], {
    //     invalid_type_error: 'Please select an printing type.',
    // }),
    // balance_current: z.coerce.number()
    //     .gt(0, { message: 'Please enter an amount greater than 0.' }),
    // restricted: z.boolean(),
    // department: z.string(),
    // card_number: z.string(),
    // card_number2: z.string()
});

const CreateUser = UserFormSchema.omit({ });

export async function createUser(prevState: State, formData: FormData) {
    const validatedFields = CreateUser.safeParse({
        userName: formData.get('user_name'),
        // userEmail: formData.get('email'),
        // notes: formData.get('notes'),
        // disabledPrinting: formData.get('disabled_printing'),
        // balance: formData.get('balance_current'),
        // restricted: formData.get('restricted'),
        // department: formData.get('department'),
        // cardNumber: formData.get('card_number'),
        // cardNumber2: formData.get('card_number2'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    }

    // Prepare data for insertion into the database
    const { 
        userName,
        userFullName,
        userEmail,
        homeDirectory,
        notes,
        disabledPrinting,
        restricted,
        balance,
        department,
        cardNumber,
        cardNumber2
    } = validatedFields.data;

    try {
        await client.query(`
            INSERT INTO tbl_user (
                user_name,
                full_name,
                email,
                notes,
                department,
                disapled_printing,
                card_number,
                card_number2,
                created_date,
                created_by,
                modified_date,
                modified_by
            )
            VALUES (
                '${userName}',
                '${userFullName}',
                '${userEmail}',
                '${notes}',
                '${homeDirectory}',
                '${disabledPrinting}',
                '${restricted}',
                '${balance}',
                '${department}',
                '${cardNumber}',
                '${cardNumber2}',
                NOW(),
                admin,
                NOW(),
                admin
            )
        `);
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create User.',
        };
    }

    revalidatePath('/user');
    redirect('/user');
}

const ModifyUser = UserFormSchema.omit({user_name: true});

export async function modifyUser(prevState: State, formData: FormData) {
    const validatedFields = ModifyUser.safeParse({
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