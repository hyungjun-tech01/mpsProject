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
    groupName: z.string({
        invalid_type_error: 'User ID must be string ',
    }).min(1, { message: "Name is required" }),
    schedulePeriod: z.enum(['NONE','PER_DAY','PER_WEEK', 'PER_MONTH', 'PER_YEAR'], {
        invalid_type_error: "Please select an 'Quota Period' status."
    }),
    scheduleAmount: z.coerce.number().min(0, { message: 'Please enter an amount not less than 0.' }),
});

const CreateDeviceGroup = GroupFormSchema.omit({groupID:true, schedulePeriod:true, scheduleAmount:true});

export async function createDeviceGroup(prevState: State, formData: FormData) {
    console.log('Create Group / formData :', formData);
    const validatedFields = CreateDeviceGroup.safeParse({
        groupName: formData.get('group_name')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };

    const { groupName } = validatedFields.data;
    const groupNotes = formData.get('group_notes');
    const groupSize = Number(formData.get('member_length'));
    const groupMembers = [];
    for(let num=0; num < groupSize; num++)
    {
        const tempName = "member_" + num;
        const memberID = formData.get(tempName);
        groupMembers.push(memberID);
    }

    // Create new group  --------------------------------------
    try {
        // 값 배열로 변환
        const groupInputData = [
            groupName,
            "device",
            groupNotes,
        ];

        await client.query("BEGIN"); // 트랜잭션 시작  

        const newGroup = await client.query(`
            INSERT INTO tbl_group_info (
                group_name,
                group_type,
                group_notes,
                created_date,
                created_by,
                modified_date,
                modified_by
            )
            VALUES ($1,$2,$3,NOW(),'admin',NOW(),'admin') RETURNING group_id`
            , groupInputData);
       
        const groupId = newGroup.rows[0].group_id;

        groupMembers.forEach(async member => client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ('${groupId}', '${member}', 'user')`
            )
        );

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Create Group / Error : ', error);
        return {
            message: 'Database Error: Failed to Create Group.',
        };
    };

    revalidatePath('/group/device');
    redirect('/group/device');
};

const CreateUserGroup = GroupFormSchema.omit({groupID:true});

export async function createUserGroup(prevState: State, formData: FormData) {
    // console.log('Create Group / formData :', formData);
    const validatedFields = CreateUserGroup.safeParse({
        groupName: formData.get('group_name'),
        schedulePeriod: formData.get('schedule_period'),
        scheduleAmount: formData.get('schedule_amount'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };

    const { groupName, schedulePeriod, scheduleAmount } = validatedFields.data;
    const scheduleStart = (schedulePeriod === 'NONE' || schedulePeriod === 'PER_DAY')
        ? 0
        : (schedulePeriod === 'PER_YEAR'
            ? Number(formData.get('schedule_start')) * 100 + Number(formData.get('schedule_start_sub'))
            : Number(formData.get('schedule_start'))
        );
    const groupNotes = formData.get('group_notes');
    const groupSize = Number(formData.get('member_length'));
    const groupMembers = [];
    for(let num=0; num < groupSize; num++)
    {
        const tempName = "member_" + num;
        const memberID = formData.get(tempName);
        groupMembers.push(memberID);
    }

    // Create new user group  --------------------------------------
    try {
        // 값 배열로 변환
        const groupInputData = [
            groupName,
            "user",
            groupNotes,
            schedulePeriod,
            scheduleAmount,
            0,
            scheduleStart,
        ];

        await client.query("BEGIN"); // 트랜잭션 시작  

        const newGroup = await client.query(`
            INSERT INTO tbl_group_info (
                group_name,
                group_type,
                group_notes,
                schedule_period,
                schedule_amount,
                remain_amount,
                schedule_start,
                created_date,
                created_by,
                modified_date,
                modified_by
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),'admin',NOW(),'admin') RETURNING group_id`
            , groupInputData);

        
        const groupId = newGroup.rows[0].group_id;

        groupMembers.forEach(async member => client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ('${groupId}', '${member}', 'user')`
            )
        );

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Create Group / Error : ', error);
        return {
            message: 'Database Error: Failed to Create Group.',
        };
    };

    revalidatePath('/group/user');
    redirect('/group/user');
};

const CreateSecurityGroup = GroupFormSchema.omit({groupID:true, schedulePeriod:true, scheduleAmount:true});

export async function createSecurityGroup(prevState: State, formData: FormData) {
    console.log('Create Group / formData :', formData);
    const validatedFields = CreateSecurityGroup.safeParse({
        groupName: formData.get('group_name')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };

    const { groupName } = validatedFields.data;
    const groupNotes = formData.get('group_notes');
    const groupSize = Number(formData.get('member_length'));
    const groupMembers = [];
    for(let num=0; num < groupSize; num++)
    {
        const tempName = "member_" + num;
        const memberID = formData.get(tempName);
        groupMembers.push(memberID);
    }

    // Create new group  --------------------------------------
    try {
        // 값 배열로 변환
        const groupInputData = [
            groupName,
            "security",
            groupNotes,
        ];

        await client.query("BEGIN"); // 트랜잭션 시작  

        const newGroup = await client.query(`
            INSERT INTO tbl_group_info (
                group_name,
                group_type,
                group_notes,
                created_date,
                created_by,
                modified_date,
                modified_by
            )
            VALUES ($1,$2,$3,NOW(),'admin',NOW(),'admin') RETURNING group_id`
            , groupInputData);
       
        const groupId = newGroup.rows[0].group_id;

        groupMembers.forEach(async member => client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ('${groupId}', '${member}', 'dept')`
            )
        );

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Create Group / Error : ', error);
        return {
            message: 'Database Error: Failed to Create Group.',
        };
    };

    revalidatePath('/group/security');
    redirect('/group/security');
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