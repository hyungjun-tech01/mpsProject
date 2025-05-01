import type { Pool } from "pg";
import { UserField, Account } from "@/app/lib/definitions";


// ----- Begin : User -------------------------------------------------------//
// const ITEMS_PER_PAGE = 10;
export async function fetchFilteredUsers(
    client: Pool,
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const users = await client.query(`
            SELECT
                u.user_id id,
                u.user_name,
                u.full_name,
                u.email,
                u.home_directory,
                u.disabled_printing,
                u.department,
                u.total_pages,
                u.total_jobs,
                null account_id,
                u.balance
            FROM tbl_user_info u
            WHERE
                u.deleted='N'
                ${query !== "" ? "AND (u.user_name ILIKE '%" + query + "%' OR"
                + "u.user_full_name ILIKE '%" + query + "%' OR"
                + "u.email ILIKE '%" + query + "%')"
                : ""}
            ORDER BY u.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `);
        return users.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users.");
    }
};

export async function fetchUsersPages(
    client: Pool,
    query: string,
    itemsPerPage: number
) {
    try {
        const count =
            query !== ""
                ? await client.query(`
                SELECT COUNT(*)
                FROM tbl_user_info u
                WHERE
                    u.deleted='N' AND
                    (
                        u.user_name ILIKE '${`%${query}%`}' OR
                        u.full_name ILIKE '${`%${query}%`}' OR
                        u.email ILIKE '${`%${query}%`}'
                    )
            `)
                : await client.query(`
                SELECT COUNT(*)
                FROM tbl_user_info u
                WHERE
                    u.deleted='N'
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch total number of invoices.");
    }
};

export async function fetchAllUsers(
    client: Pool,
) {
    try {
        const users =
            await client.query(`
            SELECT '' user_id, 
                   '-1 없음' user_name
            union all
            SELECT
                u.user_id user_id, 
                u.full_name||'('||u.user_name||')' user_name
            FROM tbl_user_info u
            WHERE
                u.deleted='N'
            ORDER BY user_name ASC
            `);
        const converted = users.rows.map((data: UserField) => ({
            ...data,
            id: data.user_id,
        }));
        return converted;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users.");
    }
};

export async function fetchUserById(
    client: Pool,
    id: string
) {
    try {
        const user = await client.query(`
            SELECT
                u.user_id,
                u.user_name,
                u.full_name,
                u.email,
                u.home_directory,
                u.disabled_printing,
                u.department,
                u.card_number,
                u.card_number2,
                null account_id,
                u.balance
            FROM tbl_user_info u
            WHERE u.user_id='${id}'
        `);

        //console.log(user.rows[0]);
        return user.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to get user by id.");
    }
};

export async function fetchUserByName(
    client: Pool,
    name: string
) {
    try {
        const user = await client.query(`
            SELECT
                u.user_id,
                u.user_name,
                u.full_name,
                u.email,
                u.home_directory,
                u.disabled_printing,
                u.department,
                u.card_number,
                u.card_number2,
                null account_id,
                u.balance
            FROM tbl_user_info u
            WHERE u.user_name='${name}'
        `);

        //console.log(user.rows[0]);
        return user.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to get user by id.");
    }
};

export async function fetchUserCount(
    client: Pool,
) {
    try {
        const count = await client.query(`
            SELECT COUNT(*)
            FROM tbl_user_info u
            WHERE
                u.deleted='N'
        `);
        return count.rows[0].count;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch user count.");
    }
};
// ----- End : User -------------------------------------------------------//


// ----- Begin : Account -------------------------------------------------------//
export async function fetchAccount(
    client: Pool,
    name: string
): Promise<Account | undefined> {
    try {
        const account = await client.query<Account>(`
            SELECT
                u.user_id id,
                u.user_name name,
                u.user_role role,
                u.email email,
                u.password password
            FROM tbl_user_info u
            WHERE u.user_name='${name}'
        `);
        const userInfo = account.rows[0];
        const deviceGroup = await client.query(`
            SELECT
                Count(*)
            FROM tbl_group_member_info
            WHERE member_id='${userInfo.id}'
            AND member_type='admin'
        `);
        if(deviceGroup.rows[0].count > 0) {
            if(userInfo.role !== 'admin') {
                userInfo.role = 'manager';
            }
        }
        return userInfo;
    } catch (error) {
        console.error("Failed to fetch user:", error);
        throw new Error("Failed to fetch user.");
    }
};
// ----- End : Account -------------------------------------------------------//
