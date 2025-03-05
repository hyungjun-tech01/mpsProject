import pg from "pg";

const client = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS,
});

await client.connect();

// ----- Begin : User -------------------------------------------------------//
// const ITEMS_PER_PAGE = 10;

export async function fetchUsersNotInGroup(
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const users = await client.query(`
                SELECT
                    u.user_id as id,
                    u.user_name as name
                FROM tbl_user_info u
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = u.user_id
                WHERE
                    u.deleted='N' AND  gm.member_id IS NULL
                ORDER BY u.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);
        return users.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users not in group.");
    }
};

export async function fetchUsersNotInGroupPages(
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT
                    COUNT(*)
                FROM tbl_user_info u
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = u.user_id
                WHERE
                    u.deleted='N' AND  gm.member_id IS NULL
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users not in group.");
    }
};

export async function fetchUsersInGroup(
    id: string
) {
    try {
        const users = await client.query(`
                SELECT
                    u.user_id as id,
                    u.user_name as name
                FROM tbl_user_info u
                JOIN tbl_group_member_info gm ON (gm.member_id = u.user_id AND gm.member_type='user')
                WHERE
                    u.deleted='N' AND u.user_id = '${id}'
                ORDER BY u.modified_date DESC
            `);
        return users.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users not in group.");
    }
};


// ----- Begin : Device -------------------------------------------------------//
// const ITEMS_PER_PAGE = 10;

export async function fetchDevicesNotInGroup(
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const devices = await client.query(`
                SELECT
                    d.device_id as id,
                    d.device_name as name
                FROM tbl_device_info d
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = d.device_id
                WHERE
                    d.deleted='N' AND  gm.member_id IS NULL
                ORDER BY d.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);
        return devices.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch devices not in group.");
    }
};

export async function fetchDeviesNotInGroupPages(
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT
                    COUNT(*)
                FROM tbl_device_info d
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = d.device_id
                WHERE
                    d.deleted='N' AND  gm.member_id IS NULL
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch devices not in group.");
    }
};

export async function fetchDevicesInGroup(
    id: string
) {
    try {
        const devices = await client.query(`
                SELECT
                    d.device_id as id,
                    d.device_name as name
                FROM tbl_device_info d
                JOIN tbl_group_member_info gm ON (gm.member_id = d.device_id AND gm.member_type='device')
                WHERE
                    d.deleted='N' AND d.device_id = '${id}'
                ORDER BY d.modified_date DESC
            `);
        return devices.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch devices not in group.");
    }
};