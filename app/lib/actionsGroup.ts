'use server';

import type { Pool } from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import getDictionary from '@/app/locales/dictionaries';
import {generateChangeLog, generateDeleteLog, generateCreateLog} from '@/app/lib/utils';
import {applicationLog} from '@/app/lib/actions';
import { GTranslate } from '@mui/icons-material';


const [t] = await Promise.all([
    getDictionary('ko')
  ]);
  

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
    updatedBy : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    ipAddress : z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
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

    const updatedBy = formData.get('updatedBy');
    const ipAddress = formData.get('ipAddress');

    //console.log('[Modify Device Group] Member :', groupMembers);
    // console.log('[Modify Device Group] Manager :', groupManager);

    // Modify device group  --------------------------------------
    try {

        let changedValues = '';

        console.log('groupID', groupID);
        const oldData1 = await client.query(`
            SELECT
                group_name, 
                group_notes
            FROM tbl_group_info
            WHERE group_id= $1
        `, [groupID]);

        console.log('groupID');

        console.log('groupID', oldData1.rows[0]);

        const oldData2 = await client.query(`
            SELECT
                member_type,
                device_name
            FROM tbl_group_member_info tgmi, tbl_device_info tdi
            WHERE tgmi.group_id= $1
            and tgmi.member_id = tdi.device_id
        `, [groupID]);

        const newData2 = await client.query(`
            SELECT 
                'device' member_type,    
                device_name
            FROM tbl_device_info tdi
            WHERE tdi.device_id = ANY($1)
        `, [groupMembers]);


        // 변경 값
        const newDeviceGroupData = {
            group_name: groupName,
            group_notes: groupNotes,
        };

        //이전 값
        let oldDeviceGroupData;
        if(oldData1.rows.length > 0) 
            oldDeviceGroupData = oldData1.rows[0];

        // Field Lable 
        const deviceGroupFieldLabels: Record<string, string> = {
            group_name: t('group.group_name'),
            group_notes: t('device.notes'),
        };

 
        console.log('changedValues', oldDeviceGroupData, newDeviceGroupData);
        // 변경 로그를 생성.
        changedValues += generateChangeLog(oldDeviceGroupData, newDeviceGroupData, deviceGroupFieldLabels);

        console.log('changedValues111111111', changedValues);
         //application Log 생성 

         if(changedValues !== ''){
            const logData = new FormData();
            logData.append('application_page', '그룹/장치그룹');
            logData.append('application_action', '수정');
            logData.append('application_parameter', changedValues);
            logData.append('created_by', updatedBy ? String(updatedBy) : "");
            logData.append('ip_address', ipAddress ? String(ipAddress) : "");
    
            applicationLog(client, logData);
         }
 
        //초기화
        changedValues = '';

        console.log('changedValues22222', changedValues);
      
        //이전 값 삭제
        const oldDeviceGroupMemberData = oldData2.rows;

        // Field Lable 
        const deviceGroupMemberFieldLabels: Record<string, string> = {
            member_type: t('group.member_type'),
            device_name: t('device.device_name'),
        };       

        for(let i=0 ; i <  oldDeviceGroupMemberData.length; i++ )
        {
            changedValues += generateDeleteLog(oldDeviceGroupMemberData[i], deviceGroupMemberFieldLabels);
        }
       
        console.log('changedValues3333', changedValues);
        const logData2 = new FormData();
         logData2.append('application_page', '그룹/장치그룹');
         logData2.append('application_action', '수정-멤버삭제');
         logData2.append('application_parameter', changedValues);
         logData2.append('created_by', updatedBy ? String(updatedBy) : "");
         logData2.append('ip_address', ipAddress ? String(ipAddress) : "");
 
         applicationLog(client, logData2);

        //초기화
        changedValues = '';
      
        // 새 값 추가 
        const newDeviceGroupMemberData = newData2.rows;

        for(let i=0 ; i <  newDeviceGroupMemberData.length; i++ )
        {
            changedValues += generateCreateLog(newDeviceGroupMemberData[i], deviceGroupMemberFieldLabels);
        }
        const logData3 = new FormData();
        logData3.append('application_page', '그룹/장치그룹');
        logData3.append('application_action', '수정-멤버추가');
        logData3.append('application_parameter', changedValues);
        logData3.append('created_by', updatedBy ? String(updatedBy) : "");
        logData3.append('ip_address', ipAddress ? String(ipAddress) : "");

        applicationLog(client, logData3);

        changedValues = '';

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
                b.full_name full_name
            FROM tbl_group_member_info a, tbl_user_info b
            WHERE group_id= $1
            AND member_type='admin'
            AND a.member_id = b.user_id
        `,[groupID]);

        const currentManager = currentMangerData.rows.length > 0 ? 
            currentMangerData.rows[0].id : "";

        let oldManager;
        if(currentMangerData.rows.length > 0) 
             oldManager = currentMangerData.rows[0];    

        const newMangerData = await client.query(`
            SELECT
                b.full_name full_name
            FROM tbl_user_info b
            WHERE b.user_id = $1
        `,[groupManager]);

        let newManager;
        if(newMangerData.rows.length > 0) 
            newManager = newMangerData.rows[0];   

             // Field Lable 
        const deviceGroupAdminFieldLabels: Record<string, string> = {
            full_name: t('user.full_name'),
        };      

        // 변경 로그를 생성.
        changedValues += generateChangeLog(oldManager, newManager, deviceGroupAdminFieldLabels);

        //application Log 생성 

        if(changedValues !== ''){
            const logData4 = new FormData();
            logData4.append('application_page', '그룹/장치그룹');
            logData4.append('application_action', '수정-그룹관리자');
            logData4.append('application_parameter', changedValues);
            logData4.append('created_by', updatedBy ? String(updatedBy) : "");
            logData4.append('ip_address', ipAddress ? String(ipAddress) : "");

            applicationLog(client, logData4);
        }

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

    const updatedBy = formData.get('updatedBy');
    const ipAddress = formData.get('ipAddress');

    // Modify user group  --------------------------------------
    try {
        let changedValues = '';
        const oldData1 = await client.query(`
            SELECT
                group_name,
                group_notes,
                schedule_period,
                schedule_amount,
                remain_amount,
                schedule_start
            FROM tbl_group_info
            WHERE group_id= $1
        `, [groupID]);

        const newUserGroupData = {group_name:groupName, group_notes:groupNotes,schedule_period:schedulePeriod,
            schedule_amount:scheduleAmount, remain_amount:remainAmount, schedule_start:scheduleStart};

        //이전 값
        const oldUserGroupData = oldData1.rows[0];

        // Field Lable 
        const userGroupFieldLabels: Record<string, string> = {
            group_name: t('group.group_name'),
            group_notes: t('device.notes'),
            schedule_period : t('group.schedule_period'),
            schedule_amount : t('group.schedule_amount'),
            remain_amount : t('group.remain_amount'),
            schedule_start : t('group.schedule_start'),
        };

        // 변경 로그를 생성.
        changedValues += generateChangeLog(oldUserGroupData, newUserGroupData, userGroupFieldLabels);
         //application Log 생성 

        if(changedValues !== ''){
            const logData = new FormData();
            logData.append('application_page', '그룹/사용자그룹');
            logData.append('application_action', '수정');
            logData.append('application_parameter', changedValues);
            logData.append('created_by', updatedBy ? String(updatedBy) : "");
            logData.append('ip_address', ipAddress ? String(ipAddress) : "");
    
            applicationLog(client, logData);
        }

        changedValues = '';

        const oldData2 = await client.query(`
        SELECT
            member_type,
            user_name
        FROM tbl_group_member_info tgmi, tbl_user_info tdi
        WHERE tgmi.group_id= $1
        and tgmi.member_id = tdi.user_id
        `, [groupID]);

        const newData2 = await client.query(`
            SELECT 
                'user' member_type,    
                user_name
            FROM tbl_user_info tdi
            WHERE tdi.user_id = ANY($1)
        `, [groupMembers]);

        //이전 값 삭제
        const oldUserGroupMemberData = oldData2.rows;

        // Field Lable 
        const deviceUserMemberFieldLabels: Record<string, string> = {
            member_type: t('group.member_type'),
            user_name: t('user.user_name'),
        };       

        for(let i=0 ; i <  oldUserGroupMemberData.length; i++ )
        {
            changedValues += generateDeleteLog(oldUserGroupMemberData[i], deviceUserMemberFieldLabels);
        }

        const logData2 = new FormData();
        logData2.append('application_page', '그룹/사용자그룹');
        logData2.append('application_action', '수정-멤버삭제');
        logData2.append('application_parameter', changedValues);
        logData2.append('created_by', updatedBy ? String(updatedBy) : "");
        logData2.append('ip_address', ipAddress ? String(ipAddress) : "");

        applicationLog(client, logData2);

        //초기화
        changedValues = '';

        // 새 값 추가 
        const newUserGroupMemberData = newData2.rows;

        for(let i=0 ; i <  newUserGroupMemberData.length; i++ )
        {
            changedValues += generateCreateLog(newUserGroupMemberData[i], deviceUserMemberFieldLabels);
        }
        const logData3 = new FormData();
        logData3.append('application_page', '그룹/사용자그룹');
        logData3.append('application_action', '수정-멤버추가');
        logData3.append('application_parameter', changedValues);
        logData3.append('created_by', updatedBy ? String(updatedBy) : "");
        logData3.append('ip_address', ipAddress ? String(ipAddress) : "");

        applicationLog(client, logData3);        


        // user 그룹 admin 수정 

        const oldUserGroupMangerData = await client.query(`
        SELECT
            a.member_id user_id,
            b.full_name full_name
        FROM tbl_group_member_info a, tbl_user_info b
        WHERE group_id= $1
        AND member_type='admin'
        AND a.member_id = b.user_id
    `,[groupID]);

    let oldManager;
    if(oldUserGroupMangerData.rows.length > 0) 
         oldManager = oldUserGroupMangerData.rows[0];    

    const newUserGroupMangerData = await client.query(`
        SELECT
            b.user_id user_id,
            b.full_name full_name
        FROM tbl_user_info b
        WHERE b.user_id = $1
    `,[groupManager]);

    let newManager;
    if(newUserGroupMangerData.rows.length > 0) 
        newManager = newUserGroupMangerData.rows[0];   

         // Field Lable 
    const userGroupAdminFieldLabels: Record<string, string> = {
        user_id : t('user.user_id'),
        full_name: t('user.full_name'),
    };      
    changedValues = '';

    // 변경 로그를 생성.
    changedValues += generateChangeLog(oldManager, newManager, userGroupAdminFieldLabels);

    //application Log 생성 

    if(changedValues !== ''){
        const logData4 = new FormData();
        logData4.append('application_page', '그룹/사용자 그룹');
        logData4.append('application_action', '수정-그룹관리자');
        logData4.append('application_parameter', changedValues);
        logData4.append('created_by', updatedBy ? String(updatedBy) : "");
        logData4.append('ip_address', ipAddress ? String(ipAddress) : "");

        applicationLog(client, logData4);
    }



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
                VALUES ($1, $2, 'security')
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
                VALUES ($1, $2, 'security')
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