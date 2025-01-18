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


// ----- Begin : User ----------------------------------------//
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
                SELECT * FROM tbl_user
                WHERE
                    tbl_user.deleted='N' AND
                    (
                        tbl_user.user_id ILIKE '${`%${query}%`}' OR
                        tbl_user.user_name ILIKE '${`%${query}%`}' OR
                        tbl_user.full_name ILIKE '${`%${query}%`}' OR
                        tbl_user.email ILIKE '${`%${query}%`}'
                    )
                ORDER BY tbl_user.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
            : await client.query(`
                SELECT * FROM tbl_user
                WHERE
                    tbl_user.deleted='N'
                ORDER BY tbl_user.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
        ;
        
        const converted = users.rows.map((data:User) => ({
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
            SELECT * FROM tbl_user
            WHERE user_id='${id}'
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
// ----- End : User ------------------------------------------//



// ----- End : Accounts -----------------------------------------//