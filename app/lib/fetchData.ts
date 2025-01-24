import pg from "pg";
import { BASE_PATH } from "@/constans";
import { User } from "@/app/lib/definitions";

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
export async function fetchFilteredUsers(
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;

    try {
        const users =
            query !== ""
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
            `);
        const converted = users.rows.map((data: User) => ({
            ...data,
            id: data.user_id,
        }));
        return converted;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch users.");
    }
}

export async function fetchUsersPages(query: string, itemsPerPage: number) {
    try {
        const count =
            query !== ""
                ? await client.query(`
                SELECT COUNT(*)
                FROM tbl_user
                WHERE
                    tbl_user.deleted='N' AND
                    (
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
            `);
        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch total number of invoices.");
    }
}

export async function fetchUserById(id: string) {
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
        console.error("Database Error:", error);
        throw new Error("Failed to get user by id.");
    }
}

export async function fetchCreateUser(newUser: object) {
    try {
        console.log("create user", newUser);
        const inputData = {
            ...newUser,
            action_type: "ADD",
            modify_user: "admin", // 추후 변경
        };
        const input_json = JSON.stringify(inputData);
        const response = await fetch(`${BASE_PATH}/modifyUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: input_json,
        });
        const data = await response.json();
        if (data.message) {
            return { result: false, data: data.message };
        }
        return { result: true };
    } catch (error) {
        return {
            result: false,
            data: "Database Error: Failed to Create User",
        };
    }
}

export async function fetchTransactionsByAccountId(
    account_id: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const transactionInfo = await client.query(`
                SELECT * FROM tbl_account_transaction
                WHERE
                    account_id='${account_id}'
                ORDER BY transaction_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);

        return transactionInfo.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch transaction by account id.");
    }
}

export async function fetchTransactionsPagesByAccountId(
    account_id: string,
    itemsPerPage: number
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
        console.error("Database Error:", error);
        throw new Error("Failed to fetch transaction by account id.");
    }
}

export async function fetchPrinterUsageLogByUserId(
    user_id: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const response = await client.query(`
                SELECT * FROM tbl_printer_usage_log pul
                JOIN tbl_printer p
                    ON p.printer_id = pul.printer_id
                WHERE
                    pul.used_by_user_id='${user_id}'
                ORDER BY usage_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);

        const printerUsageLogs = response.rows.map((row) => {
            const pages = `${row.total_pages} (Color:${row.total_color_pages})`;
            const properties = `${row.paper_size} Duplex:${row.duplex} GrayScale:${row.gray_scale} ${row.document_size_kb} kB ${row.client_machine} ${row.printer_language}`;
            let status = "";
            if (row.usage_allowed === "N") status += `Denied: ${row.denied_reason}`;
            if (row.printed === "Y") status += " Printed";
            if (row.cancelled === "Y") status += " Cancelled";
            if (row.refunded === "Y") status += " Refunded";

            return {
                ...row,
                page: pages,
                property: properties,
                status: status,
            };
        });
        return printerUsageLogs;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch transaction by account id.");
    }
}

export async function fetchPrinterUsageLogPagesByUserId(
    user_id: string,
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT COUNT(*) FROM tbl_printer_usage_log
                WHERE
                    used_by_user_id='${user_id}'
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch transaction by account id.");
    }
}

export async function fetchUserCount() {
    try {
        const count =  client.query(`
            SELECT COUNT(*)
            FROM tbl_user
            WHERE
                deleted='N'
        `);
        return count.rows[0].count;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch user count.");
    }
};

export async function fetchPrinterCount() {
    try {
        const count =  client.query(`
            SELECT COUNT(*)
            FROM tbl_printer
            WHERE
                deleted='N'
        `);
        return count.rows[0].count;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer count.");
    }
};

export async function fetchTotalPagesPerDayFor30Days() {
    try {
        const totalPagesPerDay = await client.query(`
            SELECT 
                DATE(usage_day) AS use_day,
                SUM(total_pages) AS pages
            FROM 
                tbl_printer_usage_log
            WHERE 
                usage_day >= NOW() - INTERVAL '30 day'
                AND usage_day <= NOW()
            GROUP BY 
                usage_day
            ORDER BY 
		        usage_day ASC`);
        return totalPagesPerDay.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch card data.");
    }
}

export async function fetchTodayPages() {
    try {
        const totalPagesPerDay = await client.query(`
            SELECT 
                DATE(usage_day) AS use_day,
                SUM(total_pages) AS pages
            FROM 
                tbl_printer_usage_log
            WHERE 
                usage_day >= NOW() - INTERVAL '30 day'
                AND usage_day <= NOW()
            GROUP BY 
                usage_day
            ORDER BY 
		        usage_day ASC`);
        return totalPagesPerDay.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch card data.");
    }
}
