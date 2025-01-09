import pg from 'pg';
import { BASE_PATH } from '@/constans';
import { UserField } from '@/app/lib/definitions';

const client = new pg.Client({
    user: 'planka',
    password: 'planka',
    host: 'localhost',
    port: 5432,
    database: 'planka',
    connectionTimeoutMillis: 15000
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
        const users = await client.query(`
        SELECT * FROM tbl_user_info
        WHERE
          tbl_user_info.user_id ILIKE '${`%${query}%`}' OR
          tbl_user_info.user_name ILIKE '${`%${query}%`}' OR
          tbl_user_info.mobile_number ILIKE '${`%${query}%`}' OR
          tbl_user_info.phone_number ILIKE '${`%${query}%`}' OR
          tbl_user_info.email ILIKE '${`%${query}%`}'
        ORDER BY tbl_user_info.user_name DESC
        LIMIT ${itemsPerPage} OFFSET ${offset}
      `);

        return users.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoices.');
    }
}

export async function fetchUsersPages(
    query: string,
    itemsPerPage: number,
) {
    try {
        const count = await client.query(`SELECT COUNT(*)
        FROM tbl_user_info
        WHERE
          tbl_user_info.user_id ILIKE '${`%${query}%`}' OR
          tbl_user_info.user_name ILIKE '${`%${query}%`}' OR
          tbl_user_info.mobile_number ILIKE '${`%${query}%`}' OR
          tbl_user_info.phone_number ILIKE '${`%${query}%`}' OR
          tbl_user_info.email ILIKE '${`%${query}%`}'
      `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
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
        return { result: true};
    } catch (error) {
        return {
            result: false,
            data: 'Database Error: Failed to Create User'
        };
    }
}
// ----- End : User ------------------------------------------//


// ----- Begin : Accounts ---------------------------------------//
export async function fetchSalesPersons() {
    try {
        const response = await fetch(`${BASE_PATH}/getSalespersons`);
        return await response.json();
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch salesperson data.');
    }
}
// ----- End : Accounts -----------------------------------------//