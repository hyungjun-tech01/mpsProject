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
        userDisabledPrinting?: string[];
        userBalanceCurrent?: string[];
    };
    message?: string | null;
};

const UserFormSchema = z.object({
    userName: z.string({
        invalid_type_error: 'User ID must be string ',
    }).min(1, { message: "Name is required" }),
    userDisabledPrinting: z.enum(['N', 'Y'], {
        invalid_type_error: "Please select an 'Disabled Printing' status."
    }),
    userBalanceCurrent: z.coerce.number()
        .min(0, { message: 'Please enter a balance not less than 0.' }),
});

const CreateUser = UserFormSchema.omit({ });

export async function createUser(prevState: State, formData: FormData) {
    const validatedFields = CreateUser.safeParse({
        userName: formData.get('userName'),
        userDisabledPrinting: formData.get('userDisabledPrinting'),
        userBalanceCurrent: formData.get('userBalanceCurrent'),
    });

    console.log('Check : ', validatedFields);
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
        userDisabledPrinting,
        userBalanceCurrent,
    } = validatedFields.data;
    const {
        userFullName,
        userEmail,
        homeDirectory,
        notes,
        department,
        cardNumber,
        cardNumber2
    } = formData;

    try {
        const response = await client.query(`
            INSERT INTO tbl_user (
                user_name,
                full_name,
                email,
                home_directory,
                notes,
                disabled_printing,
                department,
                card_number,
                card_number2,
                created_date,
                created_by,
                modified_date,
                modified_by
            )
            VALUES (
                '${userName}',
                '${userFullName || ""}',
                '${userEmail || ""}',
                '${homeDirectory || ""}',
                '${notes || ""}',
                '${userDisabledPrinting || "N"}',
                '${department}',
                '${cardNumber}',
                '${cardNumber2}',
                NOW(),
                'admin',
                NOW(),
                'admin'
            )
        `);
        console.log('Create User / Succeeded : ', response, userBalanceCurrent);
    } catch (error) {
        console.log('Create User / Error : ', error);
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