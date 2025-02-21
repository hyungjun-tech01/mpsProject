import pg from "pg";
import { BASE_PATH } from "@/constans";
import { UserField } from "@/app/lib/definitions";
import { generateStrOf30Days } from "./utils";

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
};

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
                a.balance,
                a.restricted
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
};

export async function fetchCreateUser(newUser: object) {
    try {
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
};

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
};

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
};

export async function fetchUserCount() {
    try {
        const count = await client.query(`
            SELECT COUNT(*)
            FROM tbl_user
            WHERE
                tbl_user.deleted='N'
        `);
        return count.rows[0].count;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch user count.");
    }
};

export async function fetchDevices() {
    try {
        const response = await client.query(`
            SELECT
                printer_id
            FROM tbl_printer
            WHERE
                tbl_printer.deleted='N'
        `);
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer count.");
    }
};


/*================= tbl_printer_usage_log =======================*/
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
            const properties = [ row.paper_size,
                `Duplex:${row.duplex}`,
                `GrayScale:${row.gray_scale}`,
                `${row.document_size_kb} kB`,
                `${row.client_machine}`,
                `${row.printer_language}`
            ];
            const status = [];
            if (row.usage_allowed === "N") status.push(`Denied: ${row.denied_reason}`);
            if (row.printed === "Y") status.push("Printed");
            if (row.cancelled === "Y") status.push("Cancelled");
            if (row.refunded === "Y") status.push("Refunded");

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
};

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
};

export async function fetchAllTotalPageSum() {
    try {
        const sum = await client.query(`
            SELECT SUM(total_pages)
            FROM tbl_printer_usage_log
        `);
        return sum.rows[0].sum;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer count.");
    }
};

export async function fetchTodayTotalPageSum() {
    try {
        const todayPages = await client.query(`
            SELECT SUM(total_pages)
            FROM tbl_printer_usage_log
            WHERE usage_day = DATE(NOW())
        `);
        return todayPages.rows[0].sum;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer count.");
    }
};

export async function fetchTotalPagesPerDayFor30Days() {
    try {
        const response = await client.query(`
            SELECT 
                DATE(usage_day) AS used_day,
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

        let maxVal = 0;
        const dataFromDB:{used_day:string, pages:number}[] = [];
        response.rows.forEach(
            (item:{used_day:Date, pages: number}) => {
                if(maxVal < item.pages) maxVal = item.pages;
                dataFromDB.push({
                    used_day: item.used_day.toISOString().split('T')[0],
                    pages: item.pages
                });
            }
        );

        // if(dataFromDB.length === 0) return null;

        const str30days = generateStrOf30Days();
        const xData: string[] = [];
        const yData: number[] = [];
        for (let i = 0; i < 30; i++) {
            const tempDayStr = str30days.at(i) || "";
            if(i % 4 ===0) {
                xData.push(tempDayStr);
            } else {
                xData.push("");
            }

            const foundIdx = dataFromDB.findIndex(data => data.used_day === tempDayStr);
            yData.push( foundIdx === -1 ? 0 : dataFromDB[foundIdx].pages);
        }
        return {date: xData, pages: yData, maxY: maxVal};
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch card data.");
    }
};

export async function fetchFilteredDeviceUsageLogs(
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const response =
            query != ""
                ? await client.query(`
                SELECT
                    pul.usage_date,
                    u.user_name,
                    p.display_name,
                    pul.total_pages,
                    pul.usage_cost,
                    pul.document_name,
                    pul.paper_size,
                    pul.duplex,
                    pul.gray_scale,
                    pul.document_size_kb,
                    pul.client_machine,
                    pul.printer_language,
                    pul.denied_reason,
                    pul.usage_allowed,
                    pul.printed,
                    pul.cancelled,
                    pul.refunded
                FROM tbl_printer_usage_log pul
                JOIN tbl_user u ON u.user_id = pul.used_by_user_id
                JOIN tbl_printer p ON p.printer_id = pul.printer_id
                WHERE
                    pul.usage_date ILIKE '${`%${query}%`}' OR
                    u.user_name ILIKE '${`%${query}%`}' OR
                    p.display_name ILIKE '${`%${query}%`}'
                ORDER BY usage_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
                : await client.query(`
                SELECT
                    pul.usage_date,
                    u.user_name,
                    p.display_name,
                    pul.total_pages,
                    pul.usage_cost,
                    pul.document_name,
                    pul.paper_size,
                    pul.duplex,
                    pul.gray_scale,
                    pul.document_size_kb,
                    pul.client_machine,
                    pul.printer_language,
                    pul.denied_reason,
                    pul.usage_allowed,
                    pul.printed,
                    pul.cancelled,
                    pul.refunded
                FROM tbl_printer_usage_log pul
                JOIN tbl_user u ON u.user_id = pul.used_by_user_id
                JOIN tbl_printer p ON p.printer_id = pul.printer_id
                ORDER BY usage_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);

        const printerUsageLogs = response.rows.map((row) => {
            const pages = `${row.total_pages} (Color:${row.total_color_pages})`;
            const properties = [ row.paper_size,
                `Duplex:${row.duplex}`,
                `GrayScale:${row.gray_scale}`,
                `${row.document_size_kb} kB`,
                `${row.client_machine}`,
                `${row.printer_language}`
            ];
            const status = [];
            if (row.usage_allowed === "N") status.push(`Denied: ${row.denied_reason}`);
            if (row.printed === "Y") status.push("Printed");
            if (row.cancelled === "Y") status.push("Cancelled");
            if (row.refunded === "Y") status.push("Refunded");

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
        throw new Error("Failed to fetch printer usage logs");
    }
};

export async function fetchFilteredDeviceUsageLogPages(
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT COUNT(*) FROM tbl_printer_usage_log
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer usage logs");
    }
};

export async function fetchLatestDeviceStatus() {
    try {
        const response = await client.query(`
            SELECT
                printer_id,
                hardware_check_status
            FROM (
                SELECT
                    p.printer_id,
                    pul.hardware_check_status,
                    ROW_NUMBER() OVER (PARTITION BY p.printer_id ORDER BY pul.usage_date DESC) AS rnk
                FROM tbl_printer p
                JOIN tbl_printer_usage_log pul ON p.printer_id = pul.printer_id
                WHERE p.deleted = 'N'
            ) latest_logs
            WHERE rnk = 1;
        `);
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer usage logs");
    }
};


/*====================== tbl_application_log =======================*/
export async function fetchFilteredApplicationLogs(
    itemsPerPage: number,
    currentPage: number,
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const response = await client.query(`
                SELECT *
                FROM tbl_application_log
                ORDER BY log_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);

        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch application logs");
    }
};

export async function fetchFilteredApplicationLogPages(
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT COUNT(*) FROM tbl_application_log
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch application logs");
    }
};


/*========================== tbl_audit_log =========================*/
export async function fetchFilteredAuditLogs(
    itemsPerPage: number,
    currentPage: number,
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const response = await client.query(`
                SELECT *
                FROM tbl_audit_log
                ORDER BY modified_date DESC
                LIMIT ${itemsPerPage} OFFSET ${offset}
            `);

        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};

export async function fetchFilteredAuditLogPages(
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT COUNT(*) FROM tbl_audit_log
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};


/*========================== Group =========================*/
export async function fetchGroupsBy(
    query : string,
    groupType : string,
    itemsPerPage: number,
    currentPage: number,
) {
    // const offset = (currentPage - 1) * itemsPerPage;
    return [];
};

export async function fetchGroupPagesBy(
    query : string,
    groupType : string,
    itemsPerPage: number,
) {
    // const offset = (currentPage - 1) * itemsPerPage;
    return 0;
};

export async function fetchGroupInfoByID(
    groupId : string,
) {
    // const offset = (currentPage - 1) * itemsPerPage;
    return [];
};

export async function fetchMembersInGroupByID(
    query : string,
    groupId : string,
    itemsPerPage: number,
    currentPage: number,
) {
    // const offset = (currentPage - 1) * itemsPerPage;
    return [];
};

export async function fetchMembersPagesByID(
    query : string,
    groupId : string,
    itemsPerPage: number,
) {
    // const offset = (currentPage - 1) * itemsPerPage;
    return 0;
};
