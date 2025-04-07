'use server';

import pg from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import * as c from 'express';


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
        balanceNew?: string[];
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

const CreateUser = UserFormSchema.omit({});

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

    // Create new user  --------------------------------------
    try {
        // 값 배열로 변환
        const userInputData = [
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
            'admin',                                          
            'N',                                              
            'admin',                                          
            'admin',                                          
            userBalanceCurrent,                               
            userRestricted === 'Y' ? 'Y' : 'N',
        ];

        await client.query("BEGIN"); // 트랜잭션 시작  

        await client.query(`
            INSERT INTO tbl_user_info (
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
                reset_by,          
                reset_date,        
                deleted,           
                created_date,      
                created_by,        
                modified_date,     
                modified_by,       
                balance,           
                restricted         
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now(),$14,now(),$15,NOW(),$16,$17,$18)`
            , userInputData);

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Create User / Error : ', error);
        return {
            message: 'Database Error: Failed to Create User.',
        };
    };

    revalidatePath('/user');
    redirect('/user');
};

const ModifyUser = UserFormSchema.omit({ userName: true, userBalanceCurrent: true });

export async function modifyUser(id: string, prevState: State, formData: FormData) {

    
    if (!formData.has('userDisabledPrinting')) {
        formData.set('userDisabledPrinting', 'N');
    }
    if (!formData.has('userRestricted')) {
        formData.set('userRestricted', 'N');
    }

    const validatedFields = ModifyUser.safeParse({
        userDisabledPrinting: formData.get('userDisabledPrinting'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };
    
    const newFullName = formData.get('userFullName');
    const newEmail = formData.get('userEmail');
    const newHomeDir = formData.get('userHomeDirectory');
    const newDisabledPrinting = formData.get('userDisabledPrinting');
    const newRestricted = formData.get('userRestricted');
    const newDept = formData.get('userDepartment');
    const newCardNo1 = formData.get('userCardNumber');
    const newCardNo2 = formData.get('userCardNumber2');

    // Prepare data for updating the database
    try {
        // First, get current data
        const resp = await client.query(`
            SELECT
                u.full_name,
                u.email,
                u.home_directory,
                u.disabled_printing,
                u.department,
                u.card_number,
                u.card_number2,
                u.restricted
            FROM tbl_user_info u
            WHERE u.user_id='${id}'
        `);
        
        const currFullName = resp.rows[0].full_name;
        const currEmail = resp.rows[0].email;
        const currHomeDir = resp.rows[0].home_directory;
        const currDisabledPrinting = resp.rows[0].disabled_printing;
        const currDept = resp.rows[0].department;
        const currCardNo1 = resp.rows[0].card_number;
        const currCardNo2 = resp.rows[0].card_number2;
        const currRestricted = resp.rows[0].restricted;

        let checkNeedUpdate = false;
        checkNeedUpdate ||= newFullName !== currFullName;
        checkNeedUpdate ||= newEmail !== currEmail;
        checkNeedUpdate ||= newHomeDir !== currHomeDir;
        checkNeedUpdate ||= newDisabledPrinting !== currDisabledPrinting;
        checkNeedUpdate ||= newDept !== currDept;
        checkNeedUpdate ||= newCardNo1 !== currCardNo1;
        checkNeedUpdate ||= newCardNo2 !== currCardNo2;
        checkNeedUpdate ||= newRestricted !== currRestricted;


        if (!checkNeedUpdate ) {
            return {
                message: 'Info: No changed data',
            };
        };

        if(checkNeedUpdate) {
            try {
                await client.query(`
                    UPDATE tbl_user_info
                    SET
                        full_name='${newFullName}',
                        email='${newEmail}',
                        home_directory='${newHomeDir}',
                        disabled_printing='${newDisabledPrinting}',
                        department='${newDept}',
                        card_number='${newCardNo1}',
                        card_number2='${newCardNo2}',
                        restricted = '${newRestricted}',
                        modified_date=NOW(),
                        modified_by='admin'
                    WHERE user_id='${id}'
                `)
            } catch (error) {
                console.log('Update User / Error : ', error);
                return {
                    message: 'Database Error: Failed to update user data.',
                };
            };
        };

    } catch (error) {
        console.log('Update User / Error : ', error);
        return {
            message: 'Database Error: Failed to get user data.',
        };
    };
    
    revalidatePath(`/user/${id}/edit`);
};

export async function deleteUser(id: string) {
    // Then, Delete user_account, account and user
    try {
        await client.query("BEGIN"); // 트랜잭션 시작

        await client.query(`
            update tbl_user_info 
            set deleted = 'Y', deleted_date = now()
            WHERE user_id='${id}'
        `);

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Delete User / Error : ', error);
        return {
            message: 'Database Error: Failed to get account by user ID.',
        };
    };

    revalidatePath('/user');
};

const ChangeBalance = z.object({
    balanceNew: z.coerce.number({
        invalid_type_error: 'Value must be number',
    }).min(0, { message: 'Please enter a balance not less than 0.' }),
});

export async function changeBalance(id: string, prevState: State, formData: FormData) {
    const validatedFields = ChangeBalance.safeParse({
        balanceNew: formData.get('balanceNew')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Change Balance.',
        };
    };

    const { balanceNew } = validatedFields.data;
    const txnComment = formData.get('txnComment');

    // First, get account id through tbl_user_account
    // let foundAccountID = null;
    // try {
    //     const resp = await client.query(`
    //         SELECT * FROM tbl_user_account WHERE user_id='${id}'
    //     `);

    //     if (resp.rows.length === 0) {
    //         return {
    //             message: 'Database Error: Failed to find account by user ID',
    //         };
    //     };
    //     foundAccountID = resp.rows[0].account_id;
    // } catch (error) {
    //     console.log('Update Balance / Error : ', error);
    //     return {
    //         message: 'Database Error: Failed to get account by user ID.',
    //     };
    // };

    // Then, Check if new value is the same with the current
    let balanceCurrent = null;
    try {
        const resp = await client.query(`
            SELECT * FROM tbl_user_info WHERE user_id='${id}'
        `);
        if (resp.rows.length === 0) return {
            message: 'Database Error: Failed to find account',
        };
        balanceCurrent = Number(resp.rows[0].balance);
    } catch (error) {
        console.log('Update Balance / Error : ', error);
        return {
            message: 'Database Error: Failed to get current balance.',
        };
    };

    if (isNaN(balanceCurrent) || (balanceCurrent === balanceNew)) {
        return {
            message: 'Info: New Balance is the same with the current.',
        };
    };

    // Next, get new account_transaction id --------------------------------------
    // let lastAccountTransactionId = null;
    // try {
    //     const resp = await client.query(`
    //         SELECT max(account_transaction_id) account_transaction_id FROM tbl_account_transaction
    //     `);
    //     lastAccountTransactionId = resp.rows.length > 0 ? Number(resp.rows[0].account_transaction_id) + 1 : 1;
    // } catch (error) {
    //     throw new Error("Failed to get account_transaction_id.");
    // };

    // Next, update balance in account and record this into account_transaction
    try {
        await client.query("BEGIN"); // 트랜잭션 시작
        await client.query(`
            UPDATE tbl_user_info
            SET
                balance='${balanceNew}',
                modified_date=NOW(),
                modified_by='admin'
            WHERE user_id='${id}'
        `);
        // await client.query(`
        //     INSERT INTO tbl_account_transaction (
        //         account_transaction_id,
        //         transaction_date,
        //         transacted_by,
        //         account_id,
        //         amount,
        //         balance,
        //         txn_comment,
        //         is_credit,
        //         transaction_type
        //     )
        //     VALUES (
        //         '${lastAccountTransactionId}',
        //         NOW(),
        //         'admin',
        //         '${foundAccountID}',
        //         '${balanceNew}',
        //         '${balanceNew}',
        //         '${txnComment}',
        //         'Y',
        //         'ADJUST'
        //     )
        // `)
        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋
    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Update Balance / Error : ', error);
        return {
            message: 'Database Error: Failed to update balance.',
        };
    };

    revalidatePath(`/user/${id}/charge`);
};

export async function deleteDocument(id: string) {
    let selected_job_type = '';
    try {
        await client.query("BEGIN"); // 트랜잭션 시작

        const doc_job = await client.query(`
            SELECT job_type FROM tbl_document_job_info
            WHERE document_id='${id}'
        `);
        selected_job_type = doc_job.rows[0].job_type.toLowerCase();;

        await client.query(`
            DELETE FROM tbl_document_shared_info
            WHERE document_id='${id}'
        `);

        await client.query(`
            UPDATE tbl_document_job_info
            SET deleted_date = now()
            WHERE document_id='${id}'
        `);

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋  
    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Delete document / Error : ', error);
        return {
            message: 'Database Error: Failed to get account by user ID.',
        };
    };

    revalidatePath(`/document/${selected_job_type}`);
};
