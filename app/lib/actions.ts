"use server";

import type { Pool } from "pg";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parse } from "csv-parse";
import bcrypt from "bcrypt";

const salt = await bcrypt.genSalt(11);

export type BasicState = {
  errors?: string;
  message?: string;
}

export type BasicState2 = {
  errors?: string[];
  message?: string;
}

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
  userName: z
    .string({
      invalid_type_error: "사용자 ID는 문자여야 합니다.",
    })
    .min(1, { message: "사용자 ID는 필수 입력 항목입니다." }),
  userDisabledPrinting: z.enum(["N", "Y"], {
    invalid_type_error: "Please select an 'Disabled Printing' status.",
  }),
  userBalanceCurrent: z.coerce
    .number()
    .min(0, { message: "금액은 0 이상이어야 합니다." }),
});

const CreateUser = UserFormSchema.omit({});

export async function createUser(
  client: Pool,
  prevState: void | UserState,
  formData: FormData
) {
  const validatedFields = CreateUser.safeParse({
    userName: formData.get("userName"),
    userDisabledPrinting: formData.get("userDisabledPrinting"),
    userBalanceCurrent: formData.get("userBalanceCurrent"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "필수 입력 누락. 새 사용자를 만들지 못했습니다.",
    };
  }

  // Prepare data for insertion into the database ------
  const { userName, userDisabledPrinting, userBalanceCurrent } =
    validatedFields.data;

  const userFullName = formData.get("userFullName");
  const userEmail = formData.get("userEmail");
  const userHomeDirectory = formData.get("userHomeDirectory");
  const userNotes = formData.get("userNotes");
  // const userRestricted = formData.get("userRestricted");
  const userDepartment = formData.get("userDepartment");
  const userCardNumber = formData.get("userCardNumber");
  const userCardNumber2 = formData.get("userCardNumber2");

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
      "admin",
      "N",
      "admin",
      "admin",
      userBalanceCurrent,
      //    userRestricted === 'Y' ? 'Y' : 'N',
    ];

    await client.query("BEGIN"); // 트랜잭션 시작

    await client.query(
      `
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
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now(),$14,now(),$15,NOW(),$16,$17)`,
      userInputData
    );
    //,           restricted
    await client.query("COMMIT"); // 모든 작업이 성공하면 커밋
  } catch (error) {
    await client.query("ROLLBACK"); // 에러 발생 시 롤백
    console.log("Create User / Error : ", error);
    return {
      message: "Database Error: Failed to Create User.",
    };
  }

  revalidatePath("/user");
  redirect("/user");
}

const ModifyUser = UserFormSchema.omit({
  userName: true,
  userBalanceCurrent: true,
});

export async function modifyUser(
  client: Pool,
  id: string,
  prevState: void | UserState,
  formData: FormData
) {
  if (!formData.has("userDisabledPrinting")) {
    formData.set("userDisabledPrinting", "N");
  }
  if (!formData.has("userRestricted")) {
    formData.set("userRestricted", "N");
  }

  const validatedFields = ModifyUser.safeParse({
    userDisabledPrinting: formData.get("userDisabledPrinting"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "필수 입력 누락. 사용자 정보를 갱신하지 못했습니다..",
    };
  }

  const newFullName = formData.get("userFullName");
  const newEmail = formData.get("userEmail");
  const newHomeDir = formData.get("userHomeDirectory");
  const newDisabledPrinting = formData.get("userDisabledPrinting");
  // const newRestricted = formData.get("userRestricted");
  const newDept = formData.get("userDepartment");
  const newCardNo1 = formData.get("userCardNumber");
  const newCardNo2 = formData.get("userCardNumber2");
  const newPwd = formData.get("userPwdNew");
  const newPwdAgain = formData.get("userPwdNewAgain");

  const changePwd =
    !!newPwd && newPwd !== "" && !!newPwdAgain && newPwdAgain !== "";

  if (
    changePwd &&
    (newPwd.toString().length < 6 || newPwdAgain.toString().length < 6)
  ) {
    return {
      message: "암호는 6자리 이상이어야 합니다.",
    };
  }

  if (changePwd && newPwd !== newPwdAgain) {
    return {
      message: "입력 암호가 일치하지 않습니다.",
    };
  }

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

    if (newFullName !== currFullName) {
      checkNeedUpdate = true;
    }
    if (newEmail !== currEmail) {
      checkNeedUpdate = true;
    }
    if (newHomeDir !== currHomeDir) {
      checkNeedUpdate = true;
    }
    if (newDisabledPrinting !== currDisabledPrinting) {
      checkNeedUpdate = true;
    }
    if (newDept !== currDept) {
      checkNeedUpdate = true;
    }
    if (newCardNo1 !== currCardNo1) {
      checkNeedUpdate = true;
    }
    if (newCardNo2 !== currCardNo2) {
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
    if (changePwd) {
      // console.log("Check :", currPassword);
      isMatched =
        !!currPassword && (await bcrypt.compare(String(newPwd), currPassword));
      // console.log("Check :", isMatched);
      if (!isMatched) {
        hashed = await bcrypt.hash(String(newPwd), salt);
        checkNeedUpdate = true;
      }
    }

    if (!checkNeedUpdate) {
      return {
        message: "변경 사항이 없습니다.",
      };
    }

    try {
      await client.query(
        `update tbl_user_info 
            set full_name = $2,
                email = $3,
                home_directory = $4,
                disabled_printing = $5,
                department= $6,
                card_number = $7,
                card_number2 = $8,
                password = $9
            where user_id= $1
            `,
        [
          id,
          newFullName,
          newEmail,
          newHomeDir,
          newDisabledPrinting,
          newDept,
          newCardNo1,
          newCardNo2,
          changePwd && !isMatched ? hashed : currPassword,
        ]
      );
    } catch (error) {
      console.log("Update User / Error : ", error);
      return {
        message: "Database Error: Failed to update user data.",
      };
    }
  } catch (error) {
    console.log("Update User / Error : ", error);
    return {
      message: "Database Error: Failed to get user data.",
    };
  }

  revalidatePath(`/user/${id}/edit`);
  redirect(`/user/${id}/edit`);
}

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
    console.log("Delete User / Error : ", error);
    return {
      message: "Database Error: Failed to get account by user ID.",
    };
  }

  revalidatePath("/user");
  redirect("/user");
}

const ChangeBalance = z.object({
  balanceNew: z.coerce
    .number({
      invalid_type_error: "Value must be number",
    })
    .min(0, { message: "Please enter a balance not less than 0." }),
});

export async function changeBalance(
  client: Pool,
  id: string,
  prevState: void | UserState,
  formData: FormData
) {
  const validatedFields = ChangeBalance.safeParse({
    balanceNew: formData.get("balanceNew"),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Change Balance.",
    };
  }

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
    if (resp.rows.length === 0)
      return {
        message: "Database Error: Failed to find account",
      };
    balanceCurrent = Number(resp.rows[0].balance);
  } catch (error) {
    console.log("Update Balance / Error : ", error);
    return {
      message: "Database Error: Failed to get current balance.",
    };
  }

  if (isNaN(balanceCurrent) || balanceCurrent === balanceNew) {
    return {
      message: "Info: New Balance is the same with the current.",
    };
  }

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
    console.log("Update Balance / Error : ", error);
    return {
      message: "Database Error: Failed to update balance.",
    };
  }

  revalidatePath(`/user/${id}/charge`);
}

export async function shareDocument(client: Pool, initState: void | BasicState, formData: FormData) {
  // console.log("Share Document / Form Data : ", formData);
  const users = formData.getAll("users") as string[];
  const expireDate = formData.get("expire_date") as string;
  const documentId = formData.get("document_id") as string;

  if (Array.isArray(users)) {
    if (users.length === 0) {
      return {
        message: "No selected users",
      };
    }
  } else {
    if (!users || users === "") {
      return {
        message: "No selected user",
      };
    }
  };

  if (!expireDate || expireDate === "") {
    return {
      message: "No expire date or invalid date",
    };
  };

  let selected_job_type = "";

  try {
    await client.query("BEGIN"); // 트랜잭션 시작

    let sharedDone = false;

    const doc_job = await client.query(`
      SELECT job_type, shared FROM tbl_document_job_info
      WHERE document_id='${documentId}'
    `);

    selected_job_type = doc_job.rows[0].job_type.toLowerCase();
    const currentShared = doc_job.rows[0].shared;

    for (const user of users) {
      const existed = await client.query(`
        SELECT * FROM tbl_document_shared_info
        WHERE document_id='${documentId}' AND shared_to='${user}'
      `);
      if (existed.rows.length > 0) {
        let newest_expire_date = expireDate;
        for (const shared of existed.rows) {
          if (shared.expire_date > newest_expire_date) {
            newest_expire_date = shared.expire_date;
          }
        };
        await client.query(`
          UPDATE tbl_document_shared_info
          SET shared_expiry_date='${newest_expire_date}'
          WHERE document_id='${documentId}' AND shared_to='${user}'
        `);
      } else {
        sharedDone = true;
        await client.query(`
          INSERT INTO tbl_document_shared_info (document_id, shared_to, shared_type, shared_expiry_date)
          VALUES ('${documentId}', '${user}', '${selected_job_type}', '${expireDate}')
        `);
      }
    }

    if (sharedDone && currentShared === 'N') {
      await client.query(`
        UPDATE tbl_document_job_info
        SET shared='Y' WHERE document_id='${documentId}'
      `);
    }

    await client.query("COMMIT"); // 모든 작업이 성공하면 커밋
  } catch (error) {
    await client.query("ROLLBACK"); // 에러 발생 시 롤백
    console.log("Share Document / Error : ", error);
    return {
      message: "Database Error: Failed to share document.",
    };
  }

  revalidatePath(`/document/${selected_job_type}`);
  redirect(`/document/${selected_job_type}`);
}

export async function deleteDocument(client: Pool, id: string, user?: string) {
  let selected_job_type = "";
  try {
    await client.query("BEGIN"); // 트랜잭션 시작

    const check_user_role = await client.query(`
      SELECT sysadmin FROM tbl_user_info WHERE user_name='${user}'
    `);
    const isAdmin = check_user_role.rows[0].sysadmin === 'Y';

    const check_doc = await client.query(`
            SELECT job_type, created_by FROM tbl_document_job_info
            WHERE document_id='${id}'
    `);
    selected_job_type = check_doc.rows[0].job_type.toLowerCase();
    const created_by = check_doc.rows[0].created_by;

    if (isAdmin || created_by === user) {
      await client.query(`
              DELETE FROM tbl_document_shared_info
              WHERE document_id='${id}'
      `);

      await client.query(`
              UPDATE tbl_document_job_info
              SET deleted_date = now(), shared='N'
              WHERE document_id='${id}'
      `);
    } else {
      await client.query(`
              DELETE FROM tbl_document_shared_info
              WHERE document_id='${id} AND shared_to='${user}'
      `);
      const check_shared = await client.query(`
        SELECT COUNT(*) FROM tbl_document_shared_info
        WHERE document_id='${id}'
      `);
      if (check_shared.rows[0].count === 0) {
        await client.query(`
          UPDATE tbl_document_job_info
          SET shared='N'
          WHERE document_id='${id}'
        `);
      }
    }

    await client.query("COMMIT"); // 모든 작업이 성공하면 커밋
  } catch (error) {
    await client.query("ROLLBACK"); // 에러 발생 시 롤백
    console.log("Delete document / Error : ", error);
    return {
      message: "Database Error: Failed to get account by user ID.",
    };
  }

  revalidatePath(`/document/${selected_job_type}`);
}

//------- Account -----------------------------------------------------------------------------
export async function updateAccount(
  client: Pool,
  prevState: void | UserState,
  formData: FormData,
  id?: string
) {
  // console.log('[Account] Update account : ', formData);
  if (!id) {
    return {
      message: "입력 ID가 없습니다.",
    };
  }

  const newPwd = formData.get("userPwdNew");
  const newPwdAgain = formData.get("userPwdNewAgain");

  const changePwd =
    !!newPwd && newPwd !== "" && !!newPwdAgain && newPwdAgain !== "";

  if (
    changePwd &&
    (newPwd.toString().length < 6 || newPwdAgain.toString().length < 6)
  ) {
    return {
      message: "암호는 6자리 이상이어야 합니다.",
    };
  }

  if (changePwd && newPwd !== newPwdAgain) {
    return {
      message: "입력한 암호가 서로 일치하지 않습니다.",
    };
  }

  const newFullName = formData.get("userFullName");
  const newEmail = formData.get("userEmail");
  // const newHomeDir = formData.get('userHomeDirectory');
  const newDept = formData.get("userDepartment");
  const newCardNo1 = formData.get("userCardNumber");
  const newCardNo2 = formData.get("userCardNumber2");

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

    if (newFullName !== currFullName) {
      sqlText += ` full_name='${newFullName}'`;
      checkNeedUpdate = true;
    }
    if (newEmail !== currEmail) {
      if (checkNeedUpdate) {
        sqlText += `, email='${newEmail}'`;
      } else {
        sqlText += ` email='${newEmail}'`;
        checkNeedUpdate = true;
      }
    }
    if (newDept !== currDept) {
      if (checkNeedUpdate) {
        sqlText += `, department='${newDept}'`;
      } else {
        sqlText += ` department='${newDept}'`;
        checkNeedUpdate = true;
      }
    }
    if (newCardNo1 !== currCardNo1) {
      if (checkNeedUpdate) {
        sqlText += `, card_number='${newCardNo1}'`;
      } else {
        sqlText += ` card_number='${newCardNo1}'`;
        checkNeedUpdate = true;
      }
    }
    if (newCardNo2 !== currCardNo2) {
      if (checkNeedUpdate) {
        sqlText += `, card_number2='${newCardNo2}'`;
      } else {
        sqlText += ` card_number2='${newCardNo2}'`;
        checkNeedUpdate = true;
      }
    }

    if (changePwd) {
      // console.log("Check :", currPassword);
      const isMatched =
        !!currPassword && (await bcrypt.compare(String(newPwd), currPassword));
      // console.log("Check :", isMatched);
      if (!isMatched) {
        const hashed = await bcrypt.hash(String(newPwd), salt);
        if (checkNeedUpdate) {
          sqlText += `, password='${hashed}'`;
        } else {
          sqlText += ` password='${hashed}'`;
          checkNeedUpdate = true;
        }
      }
    }

    if (!checkNeedUpdate) {
      return {
        message: "Info: No changed data",
      };
    }

    sqlText += `, modified_date=NOW(), modified_by='${resp.rows[0].user_name}' WHERE user_id='${id}'`;
    // console.log("[Account] Update account / sql text : ", sqlText);
    try {
      await client.query(sqlText);
    } catch (error) {
      console.log("Update Account / Error : ", error);
      return {
        message: "Database Error: Failed to update account data.",
      };
    }
  } catch (error) {
    console.log("Update Account / Error : ", error);
    return {
      message: "Database Error: Failed to update account.",
    };
  }

  revalidatePath(`/account`);
}

export async function batchCreateUser(
  client: Pool,
  id: string,
  prevState: void | BasicState,
  formData: FormData
) {
  try {
    const file = formData.get("upload_file") as Blob | null;

    if (!file) {
      return {
        error: "File blob is required.",
        message: "File이 없거나 크기가 0입니다.",
      };
    }

    // const records = [];
    parse(
      await file.text(),
      {
        delimiter: ",",
      },
      async function (err, records) {
        if (!!err) {
          console.log("CSV Parse / Error : ", err);
          return {
            message: "파일 읽기에 실패하였습니다.",
          };
        }
        if (!!records) {
          const headers = (records[0][0] === "user_name")
            ? [...records[0]]
            : [
              "user_name",
              "external_user_name",
              "full_name",
              "email",
              "notes",
              "department",
              "office",
              "card_number",
              "card_number2",
              "home_directory",
              "privilege",
              "user_source_type",
              "created_date",
              "created_by",
              "modified_date",
              "modified_by",
              "if_status"
            ];
          let idx = (records[0][0] === "user_name") ? 1 : 0;
          const adjusted = [];
          for (; idx < records.length; idx++) {
            const temp: Record<string, string> = {};
            for (let i = 0; i < records[0].length; i++) {
              temp[headers[i] as keyof typeof temp] = records[idx][i];
            }
            adjusted.push(temp);
          }

          // console.log('CSV Parse / Data : ', records);
          try {
            await client.query("BEGIN"); // 트랜잭션 시작
            for (const item of adjusted) {
              await client.query(`INSERT INTO tbl_user_info_if (
                user_name,
                external_user_name,
                full_name,
                email,
                notes,
                department,
                office,
                card_number,
                card_number2,
                home_directory,
                privilege,
                user_source_type,
                created_date,
                created_by,
                modified_date,
                modified_by,
                if_status
              ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now(),$13,now(),$14,$15)`, [
                item.user_name,
                item.external_user_name ?? "",
                item.full_name ?? "",
                item.email ?? "",
                item.notes ?? "",
                item.department ?? "",
                item.office ?? "",
                item.card_number ?? "",
                item.card_number2 ?? "",
                item.home_directory ?? "",
                item.privilege ?? "",
                "WEB",
                id,
                id,
                "INPUT",
              ]
              );
            }
            await client.query("COMMIT"); // 트랜잭션 시작
          } catch (err) {
            await client.query("ROLLBACK"); // 에러 발생 시 롤백
            console.log("Batch Create User / Error : ", err);
            return {
              message: "Database Error: Failed to write temporary user infos.",
            };
          }
        }
      }
    );
  } catch (error) {
    console.error("Error saving file:", error);
  }
  revalidatePath(`/settings/registerUsers`);
  redirect("/settings/registerUsers");
}

export async function applicationLog(client: Pool, formData: FormData) {
  try {
    const application_page = formData.get("application_page");
    const application_action = formData.get("application_action");
    const application_parameter = formData.get("application_parameter");
    const created_by = formData.get("created_by");
    const ip_address = formData.get("ip_address");

    await client.query(
      `INSERT INTO tbl_application_log_info (
            application_page,        
            application_action,        
            application_parameter,        
            created_by,
            log_date,
            log_minute_trunc,
            ip_address
          )
          VALUES ($1,$2,$3,$4,now(),to_char(now(), 'yyyy.mm.dd hh24:mi'),$5)
          ON CONFLICT (application_page, application_action, application_parameter, created_by, ip_address, log_minute_trunc) DO NOTHING;
        `,
      [application_page, application_action, application_parameter, created_by, ip_address]
    );
  } catch (error) {
    console.log("application Log / Error : ", error);
    return {
      message: "Database Error: Failed to Application Log.",
    };
  }
}

//------- Settings -----------------------------------------------------------------------------
export async function uploadSelectedUser(client: Pool, prevState: void | BasicState2, formData: FormData) {
  const seleced_ids = formData.get("selected_ids") as string;
  console.log("[uploadSelectedUser] Selected : ", seleced_ids);
  const errMsg: string[] = [];
  if (!!seleced_ids && seleced_ids !== "") {
    const splitted = seleced_ids.split(",");

    try {
      await client.query("BEGIN");

      for (const id of splitted) {
        const response = await client.query(
          `call p_create_user_if($1, $2, $3)`,
          [id, null, null]
        );
        const result = response.rows[0].x_result;
        const result_msg = response.rows[0].x_result_msg;
        if (result === "ERROR") {
          errMsg.push(id + ":" + result_msg);
        }
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK"); // 에러 발생 시 롤백
      console.log("Create User / Error : ", error);
      return {
        errors: [String(error) ?? "Unknown error"],
        message: "Database Error: Failed to Create User.",
      };
    }

    if (errMsg.length > 0) {
      return {
        errors: errMsg,
        message: "Database Error: Failed to Create User.",
      };
    }
    revalidatePath("/settings/registerUsers");
    redirect("/settings/registerUsers");
  }
}

export async function deleteUserIF(client: Pool, id: string) {
  // Then, Delete user_account, account and user
  try {
    await client.query(`
            DELETE FROM tbl_user_info_if 
            WHERE user_info_if_id='${id}'
        `);
  } catch (error) {
    console.log("Delete User In IF / Error : ", error);
    return {
      message: "Database Error: Failed to delete by ID.",
    };
  }

  revalidatePath("/settings/registerUsers");
  redirect("/settings/registerUsers");
}
