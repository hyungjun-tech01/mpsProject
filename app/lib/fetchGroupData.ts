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

const convertSchedulePeriod = {
    en: {
        NONE: 'N/A',
        PER_DAY: 'Every day',
        PER_WEEK: 'Once a week',
        PER_MONTH: 'Once a month',
        PER_YEAR: 'Once a year'
    },
    ko: {
        NONE: '없음',
        PER_DAY: '매일',
        PER_WEEK: '매주',
        PER_MONTH: '매월',
        PER_YEAR: '매년'
    }
}

// ----- Begin : Group -------------------------------------------------------//
export async function fetchGroupsBy(
    query: string,
    groupType: string,
    itemsPerPage: number,
    currentPage: number,
    locale: string
) {
    const offset = (currentPage - 1) * itemsPerPage;
    let queryString = "";

    if(groupType === "device") {
        queryString = `
            SELECT 
                g.group_id AS id,
                g.group_name AS group_name,
                g.created_date AS created_date,
                COUNT(gm.member_id) AS device_count
            FROM tbl_group_info g
            LEFT JOIN tbl_group_member_info gm ON g.group_id = gm.group_id
            WHERE g.group_type = 'device'
            ${query !== "" ? "AND g.group_name ILIKE '%" + query + "%'" : ""}
            GROUP BY g.group_id, g.group_name, g.created_date, g.modified_date
            ORDER BY g.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `;
    } else if(groupType === "user") {
        queryString = `
            SELECT 
                g.group_id AS id,
                g.group_name AS group_name,
                g.created_date AS created_date,
                g.remain_amount AS remain_amount,
                g.schedule_amount AS schedule_amount,
                g.schedule_period AS schedule_period
            FROM tbl_group_info g
            WHERE g.group_type = 'user'
            ${query !== "" ? "AND g.group_name ILIKE '%" + query + "%'" : ""}
            ORDER BY g.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `;
    } else if(groupType === "security") {
        queryString = `
            SELECT 
                g.group_id AS id,
                g.group_name AS group_name,
                g.created_date AS created_date,
                g.group_notes AS group_notes,
                COUNT(gm.member_id) as dept_count
            FROM tbl_group_info g
            LEFT JOIN tbl_group_member_info gm ON g.group_id = gm.group_id
            WHERE g.group_type = 'security'
            ${query !== "" ? "AND g.group_name ILIKE '%" + query + "%'" : ""}
            GROUP BY g.group_id, g.group_name, g.group_notes, g.created_date, g.modified_date
            ORDER BY g.modified_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
            `;
    }
    else {
        throw new Error("Wrong Group Type");
    }

    try {
        const resp = await client.query(queryString);
        if(groupType !== 'user') {
            return resp.rows;
        } else {
            const converted = resp.rows.map(item => {
                return {
                    ...item,
                    schedule_period: convertSchedulePeriod[locale][item.schedule_period]
                }    
            });
            return converted;
        }
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch goups by group type");
    }
};

export async function fetchGroupPagesBy(
    query: string,
    groupType: string,
    itemsPerPage: number,
) {
    try {
        const resp = query !== ""
            ? await client.query(`
                SELECT COUNT(*) from tbl_group_info
                WHERE
                    group_type='${groupType}' AND
                    (
                        group_name ILIKE '${`%${query}%`}'
                    )
                ORDER BY modified_date DESC
            `)
            : await client.query(`
                SELECT COUNT(*) from tbl_group_info
                WHERE group_type='${groupType}'
            `);
        const totalPages = Math.ceil(Number(resp.rows[0].count) / itemsPerPage);
        return totalPages;     
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch goups by group type");
    }
};

export async function fetchGroupInfoByID(
    groupId: string,
    groupType: string,
) {
    try {
        const resp = await client.query(`
            SELECT
                group_id id,
                group_name,
                group_type,
                group_notes,
                schedule_period,
                schedule_amount,
                schedule_start,
                remain_amount
            FROM tbl_group_info
            WHERE group_type = '${groupType}'
            AND group_id = '${groupId}'
        `);
        return resp.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch goup by ID");
    }
};

// ----- Begin : User -------------------------------------------------------//
// const ITEMS_PER_PAGE = 10;

export async function fetchUsersNotInGroup(
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const users = await client.query(`
                SELECT
                    u.user_id as id,
                    u.user_name as name,
                    u.full_name,
                    u.balance,
                    u.restricted,
                    u.total_pages,
                    u.total_jobs
                FROM tbl_user_info u
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = u.user_id
                WHERE
                    u.deleted='N' AND  gm.member_id IS NULL
                    ${query !== "" ? "AND u.user_name ILIKE '%" + query + "%'" : ""}
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
    query: string,
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
                    ${query !== "" ? "AND u.user_name ILIKE '%" + query + "%'" : ""}
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users not in group.");
    }
};

export async function fetchUsersInGroup(
    id: string,
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const users = await client.query(`
                SELECT
                    u.user_id as id,
                    u.user_name as name,
                    u.full_name,
                    u.balance,
                    u.restricted,
                    u.total_pages,
                    u.total_jobs
                FROM tbl_user_info u
                JOIN tbl_group_member_info gm ON (gm.member_id = u.user_id AND gm.member_type='user')
                WHERE
                    u.deleted='N' AND gm.group_id = '${id}'
                    ${query !== "" ? "AND u.user_name ILIKE '%" + query + "%'" : ""}
                ORDER BY u.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);
        return users.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users in group.");
    }
};

export async function fetchUsersInGroupPages(
    id: string,
    query: string,
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT
                    COUNT(*)
                FROM tbl_user_info u
                JOIN tbl_group_member_info gm ON (gm.member_id = u.user_id AND gm.member_type='user')
                WHERE
                    u.deleted='N' AND gm.group_id = '${id}'
                    ${query !== "" ? "AND u.user_name ILIKE '%" + query + "%'" : ""}
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users in group.");
    }
};

// ----- Begin : Device -------------------------------------------------------//
// const ITEMS_PER_PAGE = 10;

export async function fetchDevicesNotInGroup(
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const devices = await client.query(`
                SELECT
                    d.device_id id,
                    d.device_name name,
                    d.location,
                    d.notes,
                    d.physical_device_id,
                    d.device_model,
                    d.serial_number,
                    d.deleted,
                    d.device_status,
                    d.device_type,
                    d.ext_device_function
                FROM tbl_device_info d
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = d.device_id
                WHERE
                    d.deleted='N' AND  gm.member_id IS NULL
                    ${query !== "" ? "AND d.device_name ILIKE '%" + query + "%'" : ""}
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
    query: string,
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
                    ${query !== "" ? "AND d.device_name ILIKE '%" + query + "%'" : ""}
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch devices not in group.");
    }
};

export async function fetchDevicesInGroup(
    id: string,
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const devices = await client.query(`
                SELECT
                    d.device_id id,
                    d.device_name name,
                    d.location,
                    d.notes,
                    d.physical_device_id,
                    d.device_model,
                    d.serial_number,
                    d.deleted,
                    d.device_status,
                    d.device_type,
                    d.ext_device_function
                FROM tbl_device_info d
                JOIN tbl_group_member_info gm ON (gm.member_id = d.device_id AND gm.member_type='device')
                WHERE
                    d.deleted='N' AND gm.group_id = '${id}'
                    ${query !== "" ? "AND d.device_name ILIKE '%" + query + "%'" : ""}
                ORDER BY d.modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);
        return devices.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch devices not in group.");
    }
};

export async function fetchDevicesInGroupPages(
    id: string,
    query: string,
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT
                    COUNT(*)
                FROM tbl_device_info d
                JOIN tbl_group_member_info gm ON (gm.member_id = d.device_id AND gm.member_type='device')
                WHERE
                    d.deleted='N' AND gm.group_id = '${id}'
                    ${query !== "" ? "AND d.device_name ILIKE '%" + query + "%'" : ""}
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch depts not in group.");
    }
};

// ----- Begin : Dept -------------------------------------------------------//
// const ITEMS_PER_PAGE = 10;

export async function fetchDeptsNotInGroup(
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const depts = await client.query(`
                SELECT
                    d.dept_id as id,
                    d.dept_name as name,
                    d.dept_name as dept_name
                FROM tbl_dept_info d
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = d.dept_id
                WHERE
                    gm.member_id IS NULL
                    ${query !== "" ? "AND d.dept_name ILIKE '%" + query + "%'" : ""}
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);
        return depts.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch dept not in group.");
    }
};

export async function fetchDeptsNotInGroupPages(
    query: string,
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT
                    COUNT(*)
                FROM tbl_dept_info d
                LEFT JOIN tbl_group_member_info gm ON gm.member_id = d.dept_id
                WHERE
                    gm.member_id IS NULL
                    ${query !== "" ? "AND d.dept_name ILIKE '%" + query + "%'" : ""}
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch depts not in group.");
    }
};

export async function fetchDeptsInGroup(
    id: string,
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const depts = await client.query(`
                SELECT
                    d.dept_id as id,
                    d.dept_name as name,
                    d.dempt_name as dept_name
                FROM tbl_dept_info d
                JOIN tbl_group_member_info gm ON (gm.member_id = d.dept_id AND gm.member_type='dept')
                WHERE
                    d.dept_id = '${id}'
                    ${query !== "" ? "AND d.dept_name ILIKE '%" + query + "%'" : ""}
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);
        return depts.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch depts not in group.");
    }
};

export async function fetchDeptsInGroupPages(
    id: string,
    query: string,
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT
                    COUNT(*)
                FROM tbl_dept_info d
                JOIN tbl_group_member_info gm ON (gm.member_id = d.dept_id AND gm.member_type='dept')
                WHERE
                    d.dept_id = '${id}'
                    ${query !== "" ? "AND d.dept_name ILIKE '%" + query + "%'" : ""}
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch depts not in group.");
    }
};