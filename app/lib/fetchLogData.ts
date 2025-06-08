import type { Pool } from "pg";
import { AuditLogField } from "@/app/lib/definitions";
import { generateStrOf30Days, formatDBTime } from "./utils";



/*================= tbl_printer_usage_log =======================*/
export async function fetchPrinterUsageLogByUserId(
    client: Pool,
    userId: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const response = await client.query(`
            SELECT to_char(TO_TIMESTAMP(pul.send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD') usage_date,
                td.device_name display_name,
                pul.total_pages pages,
                pul.color_total_pages color_total_pages,
                (pul.total_pages - pul.color_total_pages) black_total_pages,
                pul.document_name document_name,
                pul.status status
            FROM tbl_audit_job_log pul, tbl_user_info tu, tbl_device_info td
            WHERE pul.user_name = tu.user_name
            and pul.device_id = td.device_id
            and tu.user_id='${userId}'
            ORDER BY usage_date DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
        `);
        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch transaction by account id.");
    }
};

export async function fetchPrinterUsageLogByUserIdPages(
    client: Pool,
    userId: string,
    itemsPerPage: number
) {
    try {
        const count = await client.query(`
                SELECT COUNT(*) 
                FROM tbl_audit_job_log pul, tbl_user_info tu
                WHERE pul.user_name = tu.user_name
                  and tu.user_id ='${userId}'
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch transaction by account id.");
    }
};

export async function fetchAllTotalPageSum(
    client: Pool,
    period: string,
    periodStart?: string,
    periodEnd?:string,
    dept?: string,
    user?: string,
) {
    const now = new Date();
    let startTime = new Date();
    let endTime = null;

    if(period === "today") {
        startTime.setDate(now.getDate() -1);
    } else if(period === "week") {
        startTime.setDate(now.getDate() -7);
    } else if(period === "month") {
        const monthVal = now.getMonth();
        startTime.setMonth(monthVal === 0 ? 11 : monthVal -1);
    } else if(period === "specified") {
        if(!!periodStart) {
            startTime = new Date(periodStart);
        } else {
            return [];
        }
        if(!!periodEnd) {
            endTime = new Date(periodEnd);
        } else {
            return [];
        }
    }

    try {
        const sum = await client.query(`
            SELECT SUM(total_pages)
            FROM tbl_audit_job_log
            WHERE CAST(send_time AS BIGINT) > ${formatDBTime(startTime)}
            ${ !!endTime ? "AND CAST(send_time AS BIGINT) <= " + formatDBTime(endTime) : ""}
            ${ user ? "AND user_name=" + user : "" }
            ${ dept ? "AND department=" + dept : "" }
        `);
        return sum.rows[0].sum;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer count.");
    }
};

export async function fetchTodayTotalPageSum(
    client: Pool,
) {
    try {
        const todayPages = await client.query(`
            SELECT SUM(total_pages)
            FROM tbl_audit_job_log
            WHERE send_time BETWEEN TO_CHAR(DATE_TRUNC('day', NOW()), 'YYMMDD') || '000000'
            AND TO_CHAR(DATE_TRUNC('day', NOW()), 'YYMMDD') || '235959'
        `);
        return todayPages.rows[0].sum;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch printer count.");
    }
};

export async function fetchTotalPagesPerDayFor30Days(
    client: Pool,
    userName: string | null | undefined,
) {
    try {
        const response = await client.query(`
            SELECT 
                TO_DATE(send_time, 'YYMMDDHH24MISS') AS used_day,
                SUM(total_pages) AS pages
            FROM tbl_audit_job_log
            WHERE send_time >= TO_CHAR(DATE_TRUNC('day',  - INTERVAL '30 days'), 'YYMMDD') || '000000'
            ${!!userName ? `AND user_name = '${userName}'` : ""}
            GROUP BY  TO_DATE(send_time, 'YYMMDDHH24MISS')
            ORDER BY used_day ASC`
        );

        let maxVal = 0;
        const dataFromDB: { used_day: string, pages: number }[] = [];
        response.rows.forEach(
            (item: { used_day: Date, pages: number }) => {
                if (maxVal < item.pages) maxVal = item.pages;
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
            if (i % 4 === 0) {
                xData.push(tempDayStr);
            } else {
                xData.push("");
            }

            const foundIdx = dataFromDB.findIndex(data => data.used_day === tempDayStr);
            yData.push(foundIdx === -1 ? 0 : dataFromDB[foundIdx].pages);
        }
        return { date: xData, pages: yData, maxY: maxVal };
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch card data.");
    }
};

export async function fetchTop5UserFor30days(client: Pool) {
    try {
        const response = await client.query(`
            SELECT 
                user_name,
                SUM(total_pages) AS total_pages_sum
            FROM tbl_audit_job_log
            WHERE send_time >= TO_CHAR(DATE_TRUNC('day',  current_date - INTERVAL '1 month'), 'YYMMDD') || '000000'
            GROUP BY  user_name
            ORDER BY total_pages_sum DESC
            LIMIT 5`
        );

        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch card data.");
    }
}

export async function fetchTop5DevicesFor30days(client: Pool) {
    try {
        const response = await client.query(`
            SELECT 
                d.device_name,
                SUM(ajl.total_pages) AS total_pages_sum
            FROM tbl_audit_job_log AS ajl
            JOIN tbl_device_info AS d ON ajl.device_id = d.device_id
            WHERE ajl.send_time >= TO_CHAR(DATE_TRUNC('day', current_date - INTERVAL '1 month'), 'YYMMDD') || '000000'
            GROUP BY  d.device_name
            ORDER BY total_pages_sum DESC
            LIMIT 5`
        );

        return response.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch card data.");
    }
}

export function parsePrivacyText(
    privacy_text: string | null
): string {
    if (!privacy_text) return ''; // Check for null or empty string

    try {
        const nameMatch = privacy_text.match(/name:"([^"]+)"/);
        const textMatch = privacy_text.match(/text:\["([^"]+)"\]/);

        const name = nameMatch ? nameMatch[1] : '';
        const text = textMatch ? textMatch[1] : '';

        return `Name: ${name}, Text: ${text} ....`;

    } catch (error) {
        console.error('Failed to parse privacy_text:', error);
        return '';
    }
}

export async function fetchFilteredAuditLogs(
    client: Pool,
    query: string,
    itemsPerPage: number,
    currentPage: number
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const auditLogs =
            query !== ""
                ? await client.query(`
            select job_log_id,
                job_type ,
                printer_serial_number ,
                job_id      ,
                user_name ,
                destination ,
                send_time,
                file_name ,
                to_char(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD HH24:MI:SS') send_date ,
                copies  ,
                original_pages ,
                CASE WHEN detect_privacy THEN 'Y' 
                ELSE 'N' 
                END AS detect_privacy,
                privacy_text,
                image_archive_path ,
                text_archive_path ,
                original_job_id  ,
                document_name,
                total_pages,
                color_total_pages
            from tbl_audit_job_log
            WHERE (
                printer_serial_number ILIKE '${`%${query}%`}' OR
                user_name ILIKE '${`%${query}%`}' OR
                document_name ILIKE '${`%${query}%`}' OR
                privacy_text ILIKE '${`%${query}%`}' 
                )			
            ORDER BY send_time DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
                : await client.query(`
            select job_log_id,
                job_type ,
                printer_serial_number ,
                job_id      ,
                user_name ,
                destination ,
                send_time,
                file_name ,
                to_char(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD HH24:MI:SS') send_date ,
                copies  ,
                original_pages ,
                CASE WHEN detect_privacy THEN 'Y' 
                ELSE 'N' 
                END AS detect_privacy,
                privacy_text,
                image_archive_path ,
                text_archive_path ,
                original_job_id  ,
                document_name,
                total_pages,
                color_total_pages
            from tbl_audit_job_log			
            ORDER BY send_time DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
            `);

        const converted = auditLogs.rows.map((data: AuditLogField) => ({
            ...data,
            id: data.job_log_id,
            privacy_text: parsePrivacyText(data.privacy_text),
            image_archive_path: data.image_archive_path,
        }));

        return converted;

    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};

export async function fetchFilteredAuditLogPages(
    client: Pool,
    query: string,
    itemsPerPage: number
) {
    try {
        const count =
            query !== ""
                ? await client.query(`
                SELECT COUNT(*) FROM tbl_audit_job_log
                 WHERE 
                    (
                        printer_serial_number ILIKE '${`%${query}%`}' OR
                        user_name ILIKE '${`%${query}%`}' OR
                        document_name ILIKE '${`%${query}%`}' OR
                        privacy_text ILIKE '${`%${query}%`}'                        
                    )
            `)
                : await client.query(`
                SELECT COUNT(*) FROM tbl_audit_job_log
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};

export async function fetchUsageStatusByUser(
    client: Pool,
    userName: string,
) {
    try {
        const result = await client.query(`
            SELECT 
                COUNT(*) as total_job_count,
                SUM(CASE WHEN job_type IN ('Copy', 'Print') THEN total_pages ELSE 0 END) as copy_print_total_pages
            FROM tbl_audit_job_log
            WHERE user_name='${userName}'
        `);
        return result.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch usage status by user");
    }
};

export async function fetchPrivacyDetectInfoByUsers(client: Pool, period: string, periodStart?:string, periodEnd?:string, dept?:string, user?:string) {
    const now = new Date();
    let startTime = new Date();
    let endTime = null;

    if(period === "today") {
        startTime.setDate(now.getDate() -1);
    } else if(period === "week") {
        startTime.setDate(now.getDate() -7);
    } else if(period === "month") {
        const monthVal = now.getMonth();
        startTime.setMonth(monthVal === 0 ? 11 : monthVal -1);
    } else if(period === "specified") {
        if(!!periodStart) {
            startTime = new Date(periodStart);
        } else {
            return [];
        }
        if(!!periodEnd) {
            endTime = new Date(periodEnd);
        } else {
            return [];
        }
    }

    console.log(`Check : ${startTime.getFullYear()}.${String(startTime.getMonth()+1).padStart(2,'0')}.${String(startTime.getDate()).padStart(2,'0')}`)

    try {
        const response = await client.query(`
            SELECT
                user_name,
                external_user_name,
                department,
                sum(detect_privacy_count) as detected,
                sum(total_count) as printed
            FROM tbl_privacy_audit_v 
            WHERE send_date >= '${startTime.getFullYear()}.${String(startTime.getMonth()+1).padStart(2,'0')}.${String(startTime.getDate()).padStart(2,'0')}'
            ${!!endTime ? "AND send_date < '" + endTime.getFullYear() 
                + "." + String(endTime.getMonth() + 1).padStart(2,'0')
                + "." + String(endTime.getDate()).padStart(2,'0') + "'" : ""}
            ${!!dept ? "AND department = '" + dept : "'"}
            ${!!user ? "AND user_name = '" + user : "'"}
            GROUP BY user_name, external_user_name, department
            ORDER BY detected DESC`
        );
        return response.rows;
    } catch (e) {
        console.log('fetchPrivacyDetectInfoByUsers :', e);
        return [];
    }
};
