import pg from 'pg';
import { BASE_PATH } from '@/constans';
import { User } from '@/app/lib/definitions';


const client = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS
});

await client.connect();


// ----- Begin : User -------------------------------------------------------//
// const ITEMS_PER_PAGE = 10;
export async function fetchFilteredUsers(
    query: string,
    itemsPerPage: number,
    currentPage: number,
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const users = query !== ''
            ? await client.query(`
                SELECT
                    u.user_id,
                    u.user_name,
                    u.full_name,
                    u.email,
                    u.home_directory,
                    u.disabled_printing,
                    u.department,
                    u.total_pages,
                    u.total_jobs,
                    a.account_id,
                    a.balance,
                    a.restricted
                FROM tbl_user u
                JOIN tbl_user_account ua ON u.user_id = ua.user_id
                JOIN tbl_account a ON a.account_id = ua.account_id
                WHERE
                    u.deleted='N' AND
                    (
                        u.user_id ILIKE '${`%${query}%`}' OR
                        u.user_name ILIKE '${`%${query}%`}' OR
                        u.full_name ILIKE '${`%${query}%`}' OR
                        u.email ILIKE '${`%${query}%`}'
                    )
                ORDER BY u.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
            : await client.query(`
                SELECT
                    u.user_id,
                    u.user_name,
                    u.full_name,
                    u.email,
                    u.home_directory,
                    u.disabled_printing,
                    u.department,
                    u.total_pages,
                    u.total_jobs,
                    a.account_id,
                    a.balance,
                    a.restricted
                FROM tbl_user u
                JOIN tbl_user_account ua ON u.user_id = ua.user_id
                JOIN tbl_account a ON a.account_id = ua.account_id
                WHERE
                    u.deleted='N'
                ORDER BY u.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
            ;

        const converted = users.rows.map((data: User) => ({
            ...data,
            id: data.user_id,
        }));
        return converted;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchUsersPages(
    query: string,
    itemsPerPage: number,
) {
    try {
        const count = query !== ''
            ? await client.query(`
                SELECT COUNT(*)
                FROM tbl_user
                WHERE
                    tbl_user.deleted='N' AND
                    (
                        tbl_user.user_id ILIKE '${`%${query}%`}' OR
                        tbl_user.user_name ILIKE '${`%${query}%`}' OR
                        tbl_user.full_name ILIKE '${`%${query}%`}' OR
                        tbl_user.email ILIKE '${`%${query}%`}'
                    )
            `)
            : await client.query(`
                SELECT COUNT(*)
                FROM tbl_user
                WHERE
                    tbl_user.deleted='N'
            `)
            ;

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchUserById(
    id: string,
) {
    try {
        const user = await client.query(`
            SELECT
                u.user_name,
                u.full_name,
                u.email,
                u.home_directory,
                u.disabled_printing,
                u.department,
                u.card_number,
                u.card_number2,
                a.account_id,
                a.balance
            FROM tbl_user u
            JOIN tbl_user_account ua ON u.user_id = ua.user_id
            JOIN tbl_account a ON a.account_id = ua.account_id
            WHERE u.user_id='${id}'
        `);

        return user.rows[0];
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to get user by id.');
    }
}

export async function fetchCreateUser(
    newUser: object,
) {
    try {
        console.log('create user', newUser);
        const inputData = {
            ...newUser,
            action_type: 'ADD',
            modify_user: 'admin',   // 추후 변경
        };
        const input_json = JSON.stringify(inputData);
        const response = await fetch(`${BASE_PATH}/modifyUser`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: input_json,
        });
        const data = await response.json();
        if (data.message) {
            return { result: false, data: data.message };
        };
        return { result: true };
    } catch (error) {
        return {
            result: false,
            data: 'Database Error: Failed to Create User'
        };
    }
}

export async function fetchTransactionsByAccountId(
    account_id: string,
) {
    try {
        const transactionInfo = await client.query(`
                SELECT * FROM tbl_account_transaction
                WHERE
                    account_id='${account_id}'
            `);

        return transactionInfo.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch transaction by account id.');
    }
}

export async function fetchTransactionsPagesByAccountId(
    account_id: string,
    itemsPerPage: number,
) {
    try {
        const count = await client.query(`
                SELECT COUNT(*) FROM tbl_account_transaction
                WHERE
                    account_id='${account_id}'
            `);

            const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
            return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch transaction by account id.');
    }
}

export async function fetchProcessLogByUserId(
    id: string,
) {
    try {
        const processlog = await client.query(`
                SELECT * FROM tbl_audit_log
                WHERE
                    tbl_audit_log.entity_id=${id}
                ORDER BY tbl_audit_log.modified_date DESC
            `);

        return processlog.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch process log by user.');
    }
}
// ----- End : User ---------------------------------------------------------//


// ----- Begin : Audit Log --------------------------------------------------//


// ----- End : Audit Log ----------------------------------------------------//