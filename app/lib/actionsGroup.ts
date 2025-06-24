'use server';

import type { Pool } from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// const client = new pg.Client({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     database: process.env.DB_NAME,
//     connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS
// });

// await client.connect();


export type GroupState = {
    errors?: {
        groupName?: string[];
        schedulePreiod?: string[];
        scheduleStart?: string[];
        scheduleStartSub?: string[];
        scheduleAmount?: string[];
        remainAmount?: string[];
        groupManager?: string[];
    };
    message?: string | null;
};

const GroupFormSchema = z.object({
    groupName: z.string({
        invalid_type_error: 'Group Name must be string ',
    }).min(1, { message: "Name is required" }),
    schedulePeriod: z.enum(['NONE','PER_DAY','PER_WEEK', 'PER_MONTH', 'PER_YEAR'], {
        invalid_type_error: "Please select an 'Quota Period' status."
    }),
    scheduleAmount: z.coerce.number().min(0, { message: 'Please enter an amount not less than 0.' }),
    remainAmount: z.coerce.number().min(0, { message: 'Please enter an amount not less than 0.' }),
});


// Device group  ------------------------------------------------
const CreateDeviceGroup = GroupFormSchema.omit({schedulePeriod:true, scheduleAmount:true, remainAmount:true});

export async function createDeviceGroup(client: Pool, prevState: void | GroupState, formData: FormData) {
    // console.log('createDeviceGroup Group / formData :', formData);
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
    const groupManager = formData.get('group_manager');
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

        for (const member of groupMembers) {
            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'device')
            `, [groupId, member]);
        }

        if(groupManager !== "")
        {
            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'admin')
            `, [groupId, groupManager]);
        }

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

const ModifyDeviceGroup = GroupFormSchema.omit({schedulePeriod:true, scheduleAmount:true, remainAmount:true});

export async function modifyDeviceGroup(client: Pool, id: string, prevState: void | GroupState, formData: FormData) {
    // console.log('modifyDeviceGroup Group / formData :', formData);
    const validatedFields = ModifyDeviceGroup.safeParse({
        groupName: formData.get('group_name')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Modify User.',
        };
    };

    const { groupName } = validatedFields.data;
    const groupID = id;
    const groupNotes = formData.get('group_notes');
    const groupSize = Number(formData.get('member_length'));
    const groupManager = formData.get('group_manager');
    const groupMembers = [];
    for(let num=0; num < groupSize; num++)
    {
        const tempName = "member_" + num;
        const memberID = formData.get(tempName);
        groupMembers.push(memberID);
    }

    //console.log('[Modify Device Group] Member :', groupMembers);
    // console.log('[Modify Device Group] Manager :', groupManager);

    // Modify device group  --------------------------------------
    try {
        await client.query("BEGIN"); // 트랜잭션 시작  

        await client.query(`
            UPDATE tbl_group_info
            SET
                group_name='${groupName}',
                group_notes='${groupNotes}',
                modified_date=NOW(),
                modified_by='admin'
            WHERE group_id='${groupID}'
            `);

        await client.query(`
            DELETE FROM tbl_group_member_info
            WHERE group_id='${groupID}'`)
       
        groupMembers.forEach(async member => client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ('${groupID}', '${member}', 'device')`
            )
        );

        const currentMangerData = await client.query(`
            SELECT
                member_id id
            FROM tbl_group_member_info
            WHERE group_id='${groupID}'
            AND member_type='admin'
        `);

        const currentManager = currentMangerData.rows.length > 0 ? 
            currentMangerData.rows[0].id : "";
        // console.log('Current Manager : ', currentManager);
        // console.log('New Manager : ', groupManager);

        if(currentManager !== groupManager) {
            if(currentManager !== "") {
                await client.query(`
                    DELETE FROM tbl_group_member_info
                    WHERE group_id='${groupID}'
                    AND member_id='${currentManager}'
                `)
            }
            if(groupManager !== "") {
                await client.query(`
                    INSERT INTO tbl_group_member_info (
                        group_id,
                        member_id,
                        member_type
                    ) VALUES ('${groupID}', '${groupManager}', 'admin')
                `)
            }
        }

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Modify Group / Error : ', error);
        return {
            message: 'Database Error: Failed to Modify Group.',
        };
    };

    revalidatePath('/group/device');
    redirect('/group/device');
};


// User group  ------------------------------------------------
const CreateUserGroup = GroupFormSchema.omit({remainAmount:true});

export async function createUserGroup(client: Pool, prevState: void | GroupState, formData: FormData) {
    // console.log('createUserGroup Group / formData :', formData);
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
    const groupManager = formData.get('group_manager');
    const groupSize = Number(formData.get('member_length'));
    const groupMembers = [];
    for(let num=0; num < groupSize; num++)
    {
        const tempName = "member_" + num;
        const memberID = formData.get(tempName);
        groupMembers.push(memberID);
    }
    // console.log('groupMembers :', groupMembers);

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

        // console.log('!!! [Create User Group] groupInputData :', groupInputData);

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

        // console.log('!!! [Create User Group] groupId :', groupId);

        // 새로운 그룹 멤버 삽입
        for (const member of groupMembers) {
            if(member === groupManager)
                continue;

            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'user')
            `, [groupId, member]);
        }

        if(groupManager !== "") {
            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'admin')
            `, [groupId, groupManager]);
        }

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

const ModifyUserGroup = GroupFormSchema.omit({});

export async function modifyUserGroup(client: Pool, id:string, prevState: void | GroupState, formData: FormData) {
    // console.log('modifyUserGroup Group / formData :', formData);
    const validatedFields = ModifyUserGroup.safeParse({
        groupName: formData.get('group_name'),
        schedulePeriod: formData.get('schedule_period'),
        scheduleAmount: formData.get('schedule_amount'),
        remainAmount: formData.get('remain_amount')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };

    const groupID = id;
    const { groupName, schedulePeriod, scheduleAmount, remainAmount } = validatedFields.data;
    const scheduleStart = (schedulePeriod === 'NONE' || schedulePeriod === 'PER_DAY')
        ? 0
        : (schedulePeriod === 'PER_YEAR'
            ? Number(formData.get('schedule_start')) * 100 + Number(formData.get('schedule_start_sub'))
            : Number(formData.get('schedule_start'))
        );
    const groupNotes = formData.get('group_notes');
    const groupSize = Number(formData.get('member_length'));
    const groupManager = formData.get('group_manager');
    const groupMembers = [];
    for(let num=0; num < groupSize; num++)
    {
        const tempName = "member_" + num;
        const memberID = formData.get(tempName);
        groupMembers.push(memberID);
    }

    // Modify user group  --------------------------------------
    try {

        await client.query("BEGIN"); // 트랜잭션 시작  

        await client.query(`
            UPDATE tbl_group_info
            SET
                group_name='${groupName}',
                group_notes='${groupNotes}',
                schedule_period='${schedulePeriod}',
                schedule_amount=${scheduleAmount},
                remain_amount=${remainAmount},
                schedule_start='${scheduleStart}',
                modified_date=NOW(),
                modified_by='admin'
            WHERE group_id='${groupID}'
            `);

        await client.query(`
            DELETE FROM tbl_group_member_info
            WHERE group_id='${groupID}'`);

        // 새로운 그룹 멤버 삽입 -> forEach 에 await 적용을 못하여 for문으로 변경 , await 적용을 못하면 순서를 보장할수 없음.
        for (const member of groupMembers) {
            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'user')
            `, [groupID, member]);
        }

        // Get current group manager ----------------------------------------------
        const currentMangerData = await client.query(`
            SELECT
                member_id id
            FROM tbl_group_member_info
            WHERE group_id='${groupID}'
            AND member_type='admin'
        `);

        const currentManager = currentMangerData.rows.length > 0 ? 
            currentMangerData.rows[0].id : "";

        // console.log('Current Manager : ', currentManager);
        // console.log('New Manager : ', groupManager);

        if(currentManager !== groupManager) {
            // Remove current group manager ----------------------------------------------
            if(currentManager !== "") {
                await client.query(`
                    DELETE FROM tbl_group_member_info
                    WHERE group_id='${groupID}'
                    AND member_id='${currentManager}'
                `)
            }
            if(groupManager !== "") {
                // Check if new group manager is in this group -------------------------
                const isMember = await client.query(`
                    SELECT COUNT(*)
                    FROM tbl_group_member_info
                    WHERE group_id='${groupID}'
                    AND member_id='${groupManager}'
                `)
                if(isMember.rows[0].count > 0) {
                    // New group manager is in this group -------------------------
                    await client.query(`
                        UPDATE tbl_group_member_info
                        SET member_type='admin'
                        WHERE group_id='${groupID}'
                        AND member_id='${groupManager}'
                    `)
                } else {
                    // New group manager is not in this group -------------------------
                    await client.query(`
                        INSERT INTO tbl_group_member_info (
                            group_id,
                            member_id,
                            member_type
                        ) VALUES ('${groupID}', '${groupManager}', 'admin')
                    `)
                }
            }
        }

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋        

    } catch (error) {
        await client.query("ROLLBACK"); // 에러 발생 시 롤백
        console.log('Modify Group / Error : ', error);
        return {
            message: 'Database Error: Failed to Modify Group.',
        };
    };

    revalidatePath('/group/user');
    redirect('/group/user');
};


// Security group  ------------------------------------------------
const CreateSecurityGroup = GroupFormSchema.omit({schedulePeriod:true, scheduleAmount:true, remainAmount:true});

export async function createSecurityGroup(client: Pool, prevState: void | GroupState, formData: FormData) {
    // console.log('CreateSecurityGroup / formData :', formData);
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
    const groupManager = formData.get('group_manager');
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


        // 새로운 그룹 멤버 삽입
        for (const member of groupMembers) {
            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'user')
            `, [groupId, member]);
        }

        if(groupManager !== "") {
            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'admin')
            `, [groupId, groupManager]);
        }

        for (const member of groupMembers) {
            await client.query(`
                UPDATE tbl_dept_info
                SET security_group_name= $1
                WHERE dept_id = $2`,[groupName, member] );
        }

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

const ModifySecurityGroup = GroupFormSchema.omit({schedulePeriod:true, scheduleAmount:true, remainAmount:true});

export async function modifySecurityGroup(client: Pool, id: string, prevState: void | GroupState, formData: FormData) {
    // console.log('ModifySecurityGroup Group / formData :', formData);
    const validatedFields = ModifySecurityGroup.safeParse({
        groupName: formData.get('group_name')
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    };

    const groupID = id;
    const { groupName } = validatedFields.data;
    const groupNotes = formData.get('group_notes');
    const groupSize = Number(formData.get('member_length'));
    const groupManager = formData.get('group_manager');
    const groupMembers = [];
    for(let num=0; num < groupSize; num++)
    {
        const tempName = "member_" + num;
        const memberID = formData.get(tempName);
        groupMembers.push(memberID);
    }

    // Modify group  --------------------------------------
    try {
        await client.query("BEGIN"); // 트랜잭션 시작  

        await client.query(`
            UPDATE tbl_group_info
            SET
                group_name='${groupName}',
                group_notes='${groupNotes}',
                modified_date=NOW(),
                modified_by='admin'
            WHERE group_id='${groupID}'
        `);

        await client.query(`
            UPDATE tbl_dept_info
            SET security_group_name=''
            WHERE dept_id IN (
                SELECT member_id 
                FROM tbl_group_member_info 
                WHERE group_id='${groupID}'
            )
        `);

        await client.query(`
            DELETE FROM tbl_group_member_info
            WHERE group_id='${groupID}'
        `);

        for (const member of groupMembers) {
            await client.query(`
                INSERT INTO tbl_group_member_info (
                    group_id,
                    member_id,
                    member_type
                )
                VALUES ($1, $2, 'dept')
            `, [groupID, member]);
        }

        for (const member of groupMembers) {
            await client.query(`
                UPDATE tbl_dept_info
                SET security_group_name=$1
                WHERE dept_id=$2
            `, [groupName, member]);
        }

        const currentMangerData = await client.query(`
            SELECT
                member_id id
            FROM tbl_group_member_info
            WHERE group_id='${groupID}'
            AND member_type='admin'
        `);

        const currentManager = currentMangerData.rows.length > 0 ? 
            currentMangerData.rows[0].id : "";

        if(currentManager !== groupManager) {
            if(currentManager !== "") {
                await client.query(`
                    DELETE FROM tbl_group_member_info
                    WHERE group_id='${groupID}'
                    AND member_id='${currentManager}'
                `)
            }
            if(groupManager !== "") {
                await client.query(`
                    INSERT INTO tbl_group_member_info (
                        group_id,
                        member_id,
                        member_type
                    ) VALUES ('${groupID}', '${groupManager}', 'admin')
                `)
            }
        }

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


// Delete group  ------------------------------------------------
export async function deleteGroup(client: Pool, id: string) {
    // console.log('[actionsGroup] deleteGroup :', id);
    let category = "";
    try {
        await client.query("BEGIN"); // 트랜잭션 시작  

        const selectedGroup = await client.query(`
            SELECT * FROM tbl_group_info WHERE group_id='${id}'
        `);

        category = selectedGroup.rows[0].group_type;

        await client.query(`
            DELETE FROM tbl_group_info WHERE group_id='${id}'
        `);

        await client.query(`
            DELETE FROM tbl_group_member_info WHERE group_id='${id}'
        `);

        await client.query("COMMIT"); // 모든 작업이 성공하면 커밋 
    } catch (error) {
        console.log('Delete Group / Error : ', error);
        return {
            message: 'Database Error: Failed to delete group by group ID.',
        };
    }

    revalidatePath(`/group/${category}`);
    redirect(`/group/${category}`);
}