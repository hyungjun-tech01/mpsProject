'use server';

import type { Pool } from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from "bcrypt";


const salt = await bcrypt.genSalt(11);

export type UserState = {
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
        invalid_type_error: '사용자 ID는 문자여야 합니다.',
    }).min(1, { message: "사용자 ID는 필수 입력 항목입니다." }),
    userDisabledPrinting: z.enum(['N', 'Y'], {
        invalid_type_error: "Please select an 'Disabled Printing' status."
    }),
    userBalanceCurrent: z.coerce.number()
        .min(0, { message: '금액은 0 이상이어야 합니다.' }),
});

const CreateUser = UserFormSchema.omit({});

export async function createUser(client: Pool, prevState: UserState, formData: FormData) {
    const validatedFields = CreateUser.safeParse({
        userName: formData.get('userName'),
        userDisabledPrinting: formData.get('userDisabledPrinting'),
        userBalanceCurrent: formData.get('userBalanceCurrent'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: '필수 입력 누락. 새 사용자를 만들지 못했습니다.',
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
        //    userRestricted === 'Y' ? 'Y' : 'N',
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
                balance   
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now(),$14,now(),$15,NOW(),$16,$17)`
            , userInputData);
//,           restricted      
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

export async function modifyUser(client: Pool, id: string, prevState: UserState, formData: FormData) {
    
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
            message: '필수 입력 누락. 사용자 정보를 갱신하지 못했습니다..',
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
    const newPwd = formData.get('userPwdNew');
    const newPwdAgain = formData.get('userPwdNewAgain');

    const changePwd = (!!newPwd && newPwd !== '') && (!!newPwdAgain && newPwdAgain !== '');

    if(changePwd && (newPwd.toString().length < 6 || newPwdAgain.toString().length < 6)) {
        return {
            errors: ["암호 길이 작음"],
            message: '암호는 6자리 이상이어야 합니다.',
        };
    };

    if(changePwd && (newPwd !== newPwdAgain)) {
        return {
            errors: ["입력 암호 불일치"],
            message: '입력 암호가 일치하지 않습니다.',
        };
    };

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
                u.password
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
        // const currRestricted = resp.rows[0].restricted;
        const currPassword = resp.rows[0].password;

        let checkNeedUpdate = false;
//        let sqlText = "UPDATE tbl_user_info SET";

        if(newFullName !== currFullName) {
            checkNeedUpdate = true;
        }
        if(newEmail !== currEmail) {
                checkNeedUpdate = true;
        }
        if(newHomeDir !== currHomeDir) {
            checkNeedUpdate = true;
        }
        if(newDisabledPrinting !== currDisabledPrinting) {
            checkNeedUpdate = true;
        }
        if(newDept !== currDept) {
            checkNeedUpdate = true;
        }
        if(newCardNo1 !== currCardNo1) {
            checkNeedUpdate = true;
        }
        if(newCardNo2 !== currCardNo2) {
            checkNeedUpdate = true;
        }
        // if(newRestricted !== currRestricted) {
        //     if(checkNeedUpdate) {
        //         sqlText += `, restricted='${newCardNo2}'`;
        //     } else {
        //         sqlText += ` restricted='${newCardNo2}'`;
        //         checkNeedUpdate = true;
        //     }
        // }
        let hashed = null;
        let isMatched = true;
        if(changePwd) {
            // console.log("Check :", currPassword);
            isMatched = !!currPassword && await bcrypt.compare(String(newPwd), currPassword);
            // console.log("Check :", isMatched);
            if(!isMatched) {
                hashed = await bcrypt.hash(String(newPwd), salt);
                checkNeedUpdate = true;

            }
        }

        if (!checkNeedUpdate ) {
            return {
                message: '변경 사항이 없습니다.',
            };
        };

        try {
            await client.query(`update tbl_user_info 
            set full_name = $2,
                email = $3,
                home_directory = $4,
                disabled_printing = $5,
                department= $6,
                card_number = $7,
                card_number2 = $8,
                password = $9
            where user_id= $1
            `,[id,newFullName, newEmail, newHomeDir, newDisabledPrinting, newDept, newCardNo1, newCardNo2, changePwd&&!isMatched ? hashed : currPassword]);
        } catch (error) {
            console.log('Update User / Error : ', error);
            return {
                message: 'Database Error: Failed to update user data.',
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

export async function deleteUser(client: Pool, id: string) {
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

export async function changeBalance(client: Pool, id: string, prevState: UserState, formData: FormData) {
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
    // const txnComment = formData.get('txnComment');

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

export async function deleteDocument(client: Pool, id: string) {
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


//------- Account -----------------------------------------------------------------------------
export async function updateAccount(client: Pool, id: string, prevState: UserState, formData: FormData) {
    // console.log('[Account] Update account : ', formData);
    const newPwd = formData.get('userPwdNew');
    const newPwdAgain = formData.get('userPwdNewAgain');
    
    const changePwd = (!!newPwd && newPwd !== '') && (!!newPwdAgain && newPwdAgain !== '');

    if(changePwd && (newPwd.toString().length < 6 || newPwdAgain.toString().length < 6)) {
        return {
            errors: ["암호 길이 작음"],
            message: '암호는 6자리 이상이어야 합니다.',
        };
    };

    if(changePwd && (newPwd !== newPwdAgain)) {
        return {
            errors: ["암호 불일치"],
            message: '입력한 암호가 서로 일치하지 않습니다.',
        };
    };

    const newFullName = formData.get('userFullName');
    const newEmail = formData.get('userEmail');
    // const newHomeDir = formData.get('userHomeDirectory');
    const newDept = formData.get('userDepartment');
    const newCardNo1 = formData.get('userCardNumber');
    const newCardNo2 = formData.get('userCardNumber2'); 

    // Prepare data for updating the database
    try {
        // First, get current data
        const resp = await client.query(`
            SELECT
                u.user_name,
                u.full_name,
                u.email,
                u.department,
                u.card_number,
                u.card_number2,
                u.password
            FROM tbl_user_info u
            WHERE u.user_id='${id}'
        `);

        const currFullName = resp.rows[0].full_name;
        const currEmail = resp.rows[0].email;
        const currDept = resp.rows[0].department;
        const currCardNo1 = resp.rows[0].card_number;
        const currCardNo2 = resp.rows[0].card_number2;
        const currPassword = resp.rows[0].password;

        let checkNeedUpdate = false;
        let sqlText = "UPDATE tbl_user_info SET";

        if(newFullName !== currFullName) {
            sqlText += ` full_name='${newFullName}'`;
            checkNeedUpdate = true;
        }
        if(newEmail !== currEmail) {
            if(checkNeedUpdate) {
                sqlText += `, email='${newEmail}'`;
            } else {
                sqlText += ` email='${newEmail}'`;
                checkNeedUpdate = true;
            }
        }
        if(newDept !== currDept) {
            if(checkNeedUpdate) {
                sqlText += `, department='${newDept}'`;
            } else {
                sqlText += ` department='${newDept}'`;
                checkNeedUpdate = true;
            }
        }
        if(newCardNo1 !== currCardNo1) {
            if(checkNeedUpdate) {
                sqlText += `, card_number='${newCardNo1}'`;
            } else {
                sqlText += ` card_number='${newCardNo1}'`;
                checkNeedUpdate = true;
            }
        }
        if(newCardNo2 !== currCardNo2) {
            if(checkNeedUpdate) {
                sqlText += `, card_number2='${newCardNo2}'`;
            } else {
                sqlText += ` card_number2='${newCardNo2}'`;
                checkNeedUpdate = true;
            }
        }
        
        if(changePwd) {
            // console.log("Check :", currPassword);
            const isMatched = !!currPassword && await bcrypt.compare(String(newPwd), currPassword);
            // console.log("Check :", isMatched);
            if(!isMatched) {
                const hashed = await bcrypt.hash(String(newPwd), salt);
                if(checkNeedUpdate) {
                    sqlText += `, password='${hashed}'`;
                } else {
                    sqlText += ` password='${hashed}'`;
                    checkNeedUpdate = true;
                }
            }
        }

        if (!checkNeedUpdate ) {
            return {
                message: 'Info: No changed data',
            };
        };

        sqlText += `, modified_date=NOW(), modified_by='${resp.rows[0].user_name}' WHERE user_id='${id}'`;
        console.log('[Account] Update account / sql text : ', sqlText);
        try {
            await client.query(sqlText);
        } catch (error) {
            console.log('Update Account / Error : ', error);
            return {
                message: 'Database Error: Failed to update account data.',
            };
        };

    } catch (error) {
        console.log('Update Account / Error : ', error);
        return {
            message: 'Database Error: Failed to update account.',
        };
    };
    
    revalidatePath(`/account`);
};

export async function batchCreateUser(client: Pool, prevState: UserState, formData: FormData)
{



};

export async function applicationLog(client: Pool,  formData: FormData)
{
    try {

        const application_page = formData.get('application_page');
        const application_action = formData.get('application_action');
        const application_parameter = formData.get('application_parameter');
        const created_by = formData.get('created_by');

        await client.query(`
            INSERT INTO tbl_application_log_info (
                application_page,        
                application_action,        
                application_parameter,        
                created_by,
                log_date
            )
            VALUES ($1,$2,$3,$4,now())`
            , [application_page, application_action, application_parameter, created_by]);

    } catch (error) {
        console.log('application Log / Error : ', error);
        return {
            message: 'Database Error: Failed to Application Log.',
        };
    };

}