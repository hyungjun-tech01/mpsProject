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

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };

    // Prepare data for insertion into the database ------
    const { 
        userName,
        userDisabledPrinting,
        userBalanceCurrent,
    } = validatedFields.data;

    const userFullName = formData.get('userFullName');
    const userEmail = formData.get('userEmail')
    const userHomeDirectory = formData.get('userHomeDirectory')
    const userNotes = formData.get('userNotes')
    const userRestricted = formData.get('userRestricted')
    const userDepartment = formData.get('userDepartment')
    const userCardNumber = formData.get('userCardNumber')
    const userCardNumber2 = formData.get('userCardNumber2')

    // Get new user id --------------------------------------
    let lastUserId = null;
    try {
        const resp = await client.query(`
            SELECT * FROM tbl_user ORDER BY user_id DESC LIMIT 1
        `);
        lastUserId = Number(resp.rows[0].user_id) + 1;
    } catch (error) {
        throw new Error("Failed to get user id.");
    };

    // Create new user  --------------------------------------
    try {
        await client.query(`
            INSERT INTO tbl_user (
                user_id,
                user_name,
                external_user_name,
                full_name,
                email,
                home_directory,
                notes,
                disabled_printing,
                department,
                card_number,
                card_number2,
                total_jobs,
                total_pages,
                total_sheets,
                reset_by,
                reset_date,
                deleted,
                created_date,
                created_by,
                modified_date,
                modified_by,
                net_total_megabytes,
                net_total_time_hours,
                disabled_net,
                internal,
                modified_ticks
            )
            VALUES (
                '${lastUserId}',
                '${userName}',
                '${userName}',
                '${userFullName || ""}',
                '${userEmail || ""}',
                '${userHomeDirectory || ""}',
                '${userNotes || ""}',
                '${userDisabledPrinting || "N"}',
                '${userDepartment || ""}',
                '${userCardNumber || ""}',
                '${userCardNumber2 || ""}',
                0, 0, 0,
                'admin', NOW(), 'N',
                NOW(), 'admin',
                NOW(), 'admin',
                0, 0, 'N',
                'N', 0
            )
        `);
        console.log('Succeeded to create new user. then create account');

    } catch (error) {
        console.log('Create User / Error : ', error);
        return {
            message: 'Database Error: Failed to Create User.',
        };
    };

    // Get new account id --------------------------------------
    let lastAccountId = null;
    try {
        const resp = await client.query(`
            SELECT * FROM tbl_account ORDER BY account_id DESC LIMIT 1
        `);
        lastAccountId = Number(resp.rows[0].account_id) + 1;
    } catch (error) {
        // Delete created user
        try{
            await client.query(`
                DELETE FROM tbl_user WHERE user_id='${lastUserId}'
            `)
        } catch (error) {
            throw new Error("Failed to remove created user.");
        };
        throw new Error("Failed to get account id.");
    };

    // Create new account --------------------------------------
    try {
        await client.query(`
            INSERT INTO tbl_account (
                account_id,
                account_type,
                account_name,
                balance,
                restricted,
                overdraft,
                pin,
                use_global_overdraft,
                notes,
                deleted,
                created_date,
                created_by,
                modified_date,
                modified_by,
                account_name_lower,
                sub_name,
                sub_name_lower,
                disabled,
                comments,
                invoicing,
                sub_pin,
                modified_ticks
            )
            VALUES (
                '${lastAccountId}',
                'USER',
                '${userName}',
                '${userBalanceCurrent}',
                '${userRestricted === 'Y' ? 'Y' : 'N'}',
                0, '', 'Y', '', 'N',
                NOW(), 'admin', NOW(), 'admin',
                '${userName.toLowerCase()}',
                '', '', 'N', 'COMMENT_OPTIONAL', 'USER_CHOICE_ON', '', 0
            )
        `);
    } catch (error) {
        // Delete created user
        try{
            await client.query(`
                DELETE FROM tbl_user WHERE user_id='${lastUserId}'
            `)
        } catch (error) {
            throw new Error("Failed to remove created user.");
        };
        throw new Error("Failed to create account.");
    };

    // Get new account id --------------------------------------
    let lastUserAccountId = null;
    try {
        const resp = await client.query(`
            SELECT * FROM tbl_user_account ORDER BY user_account_id DESC LIMIT 1
        `);
        lastUserAccountId = Number(resp.rows[0].user_account_id) + 1;
    } catch (error) {
        // Delete created user
        try{
            await client.query(`
                DELETE FROM tbl_user WHERE user_id='${lastUserId}'
            `);
            await client.query(`
                DELETE FROM tbl_account WHERE account_id='${lastAccountId}'
            `);
        } catch (error) {
            throw new Error("Failed to remove created user or created account.");
        };
        throw new Error("Failed to get account id.");
    };

    // Create new user_account --------------------------------------
    try {
        await client.query(`
            INSERT INTO tbl_user_account (
                user_account_id,
                user_id,
                account_id,
                created_date,
                created_by,
                modified_date,
                modified_by,
                modified_ticks
            )
            VALUES (
                '${lastUserAccountId}',
                '${lastUserId}',
                '${lastAccountId}',
                NOW(), 'admin', NOW(), 'admin', 0
            )
        `);
    } catch (error) {
        // Delete created user
        try{
            await client.query(`
                DELETE FROM tbl_user WHERE user_id='${lastUserId}'
            `);
            await client.query(`
                DELETE FROM tbl_account WHERE account_id='${lastAccountId}'
            `);
        } catch (error) {
            throw new Error("Failed to remove created user and created account.");
        };
        throw new Error("Failed to create user_account.");
    };

    revalidatePath('/user');
    redirect('/user');
}

const ModifyUser = UserFormSchema.omit({userName: true});

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