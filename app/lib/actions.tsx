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
            SELECT max(user_id) user_id FROM tbl_user 
        `);
        lastUserId = resp.rows.length > 0 ? Number(resp.rows[0].user_id) + 1 : 1;
    } catch (error) {
        throw new Error("Failed to get user id.");
    };

     // Get new account id --------------------------------------
     let lastAccountId = null;
     try {
         const resp = await client.query(`
             SELECT max(account_id) account_id FROM tbl_account
         `);
         lastAccountId = resp.rows.length > 0 ? Number(resp.rows[0].account_id) + 1 : 1;
     } catch (error) {
         throw new Error("Failed to get account id.");
     };

     // Get new account id --------------------------------------
    let lastUserAccountId = null;
    try {
        const resp = await client.query(`
            SELECT max(user_account_id) user_account_id FROM tbl_user_account
        `);
        
        lastUserAccountId = resp.rows.length > 0 ?  Number(resp.rows[0].user_account_id) + 1 : 1;

    } catch (error) {
        throw new Error("Failed to get account id.");
    };


    // Create new user  --------------------------------------
    try {
        // 값 배열로 변환
        const userInputData = [
            lastUserId,
            userName,
            userName,
            userFullName,
            userEmail,
            userHomeDirectory,
            userNotes,
            userDisabledPrinting,
            userDepartment,
            userCardNumber,
            userCardNumber2,
            0, 
            0, 
            0,
            'admin', 
            'N',
            'admin',
            'admin',
            0, 
            0, 
            'N',
            'N', 
            0
          ];

        const accountInputData = [
            lastAccountId,
            'USER',
            userName,
            userBalanceCurrent,
            userRestricted === 'Y' ? 'Y' : 'N',
            0,
            '',
            'Y',
            '',
            'N',
            'admin',
            'admin',
            userName.toLowerCase(),
            '',
            '',
            'N',
            'COMMENT_OPTIONAL',
            'USER_CHOICE_ON',
            '',
            0
          ];  

        const userAccountInputData = [  
           lastUserAccountId,
           lastUserId,
           lastAccountId,
           'admin', 
           'admin',
           0
         ];

        await client.query("BEGIN"); // 트랜잭션 시작  

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
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, $14,$15, NOW(), $16,NOW(), $17,NOW(), $18,$19, $20, $21,$22,$23)`
            , userInputData);
        console.log('Succeeded to create new user. then create account');

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
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),$11,NOW(),$12,$13,$14,$15,$16,$17,$18,$19,$20)`
        , accountInputData);        

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
            VALUES ($1,$2,$3,NOW(),$4,NOW(), $5,$6)`, userAccountInputData);

    await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Create User / Error : ', error);
        return {
            message: 'Database Error: Failed to Create User.',
        };
    };

        // Get new application log id -------------------------------------------------------------------------
    let lastApplicationLogId = null;
    try {
        const resp = await client.query(`
            SELECT max(application_log_id) application_log_id FROM tbl_application_log
        `);
        lastApplicationLogId = resp.rows.length > 0 ?  Number(resp.rows[0].application_log_id) + 1 : 1;
    } catch (error) {
        throw new Error("Failed to get application_log id.");
    };

    // Create new application log -------------------------------------------------------------------------
    try {
        await client.query(`
            INSERT INTO tbl_application_log (
                application_log_id,
                log_date,
                server_name,
                log_level,
                message
            )
            VALUES (
                '${lastApplicationLogId}',
                NOW(), '', 'INFO',
                '신규 계정 생성 : ${userName}'
            )
        `);
    } catch (error) {
        throw new Error("Failed to create application_log.");
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

    revalidatePath('/user');
    redirect('/user');
}

export async function deleteUser(id: string) {
    // try {
    //     await client.query(`DELETE FROM tbl_user WHERE user_id = '${id}'`);
    // } catch (error) {
    //     return {
    //         message: 'Database Error: Failed to Delete selected user.',
    //     };
    // }

    revalidatePath('/user');
}

const BalanceFormSchema = z.object({
    userName: z.string({
        invalid_type_error: 'User ID must be string ',
    }).min(1, { message: "Name is required" }),
    userDisabledPrinting: z.enum(['N', 'Y'], {
        invalid_type_error: "Please select an 'Disabled Printing' status."
    }),
    userBalanceCurrent: z.coerce.number()
        .min(0, { message: 'Please enter a balance not less than 0.' }),
});