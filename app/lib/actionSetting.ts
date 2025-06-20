'use server';

import type { Pool } from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


export type RegularExpState = {
    errors?: {
        regularExpName?: string[];
        regularExpType?: string[];
        regularExpValue?: string[];
        createdBy?: string[];
    };
    message?: string | null;
};

const RegularExprFormSchema = z.object({
    regularExpName: z.string({
        invalid_type_error: 'Regular Expression Name must be string ',
    }).min(1, { message: "Name is required" }),
    regularExpType: z.string({
        invalid_type_error: 'Regular Expression Type must be string ',
    }).min(1, { message: "Type is required" }),
    regularExpValue: z.string({
        invalid_type_error: 'Regular Expression Value must be string ',
    }).min(1, { message: "Value is required" }),
    createdBy: z.string({
        invalid_type_error: 'Created By must be string ',
    }).min(1, { message: "Value is required" }),    
});


// Regular Exp  ------------------------------------------------
const CreateRegularExpr = RegularExprFormSchema;

export async function createRegularExp(client: Pool, prevState: RegularExpState, formData: FormData) {
    //console.log('createRegularExp  :', formData);
    const validatedFields = CreateRegularExpr.safeParse({
        regularExpName: formData.get('security_name'),
        regularExpType: formData.get('security_type'),
        regularExpValue: formData.get('security_value'),
        createdBy: formData.get('created_by'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Regular Expression.',
        };
    };

    const { regularExpName, regularExpType, regularExpValue, createdBy } = validatedFields.data;
    
    console.log('Regular Exp :', regularExpName, regularExpType, regularExpValue, createdBy);

    // Create new user group  --------------------------------------
    try {
       
        // console.log('!!! [Create User Group] groupInputData :', groupInputData);

        await client.query("BEGIN"); // 트랜잭션 시작  

        await client.query(`
            INSERT INTO tbl_security_value_info (
                security_name,
                security_type,
                security_word,
                created_by,
                creation_date
            )
            VALUES ($1,$2,$3,$4,now())`
        , [regularExpName, regularExpType, regularExpValue, createdBy]);
        
        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Regular Expr  / Error : ', error);
        return {
            message: 'Database Error: Failed to Create Group.',
        };
    };

    revalidatePath('/settings/regularExprPrivateInfo');
    redirect('/settings/regularExprPrivateInfo');
};

export async function deleteRegularExp(client: Pool, id: string ) {
    try {
        console.log("deleteRegularExp", id);
        await client.query(`
            delete from tbl_security_value_info
            where security_value_id =$1
        `,[id]);

    } catch (error) {
        console.log('Delete regular exp / Error : ', error);
        return {
            result: false,
            data: "Database Error: Failed to Delete regular exp",
        };
    };
    
    revalidatePath('/settings/regularExprPrivateInfo');
    redirect('/settings/regularExprPrivateInfo');
}