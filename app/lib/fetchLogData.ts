import type { Pool } from "pg";
import { AuditLogField } from "@/app/lib/definitions";
import { generateStrOf30Days, formatTimeYYYYpMMpDD } from "./utils";



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
            and pul.send_time <> '0'
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
                  and pul.send_time <> '0'
                  and tu.user_id ='${userId}'
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch transaction by account id.");
    }
};

export async function fetchPrivacytDetectedData(
    client: Pool,
    period: string,
    periodStart?: string,
    periodEnd?:string,
    dept?: string,
    user?: string,
) {
    const now = new Date();
    let startTime = null;
    let endTime = null;
    const startDate = new Date();

    if(period !== "specified") {
        if(period === 'week') {
            startDate.setDate(now.getDate() - 6);
        } else if(period === 'month') {
            startDate.setMonth(now.getMonth() - 1);
        }
        startTime = (startDate.getFullYear()%100)*1e12 + (startDate.getMonth()+1)*1e10 + startDate.getDate()*1e8;
    } else {
        if(!!periodStart) {
            const splitted = periodStart.split('.');
            startTime = Number(splitted[0].slice(-2) + splitted[1] + splitted[2])*1e8;
        }
        if(!!periodEnd) {
            const splitted = periodEnd.split('.');
            endTime = Number(splitted[0].slice(-2) + splitted[1] + splitted[2] + '23595999');
        }
    }
    
    try {
        const sum = await client.query(`
            SELECT
                ui.user_id,
                ui.user_name,
                ajl.send_time,
                di.dept_name,
                ajl.detect_privacy
            FROM tbl_audit_job_log ajl
            JOIN tbl_user_info ui ON ajl.user_name = ui.user_name
            JOIN tbl_dept_info di ON ui.department = di.dept_id
            WHERE 1 = 1 
            and ajl.send_time <> '0'
            and ajl.send_time >= '${startTime}'
            ${!!endTime ? "AND ajl.send_time <= '" + endTime + "'" : "" }
            ${!!user ? "AND (ui.user_id like '%" + user + "%' OR ui.user_name like '%" + user + "%')" : ""}
            ${!!dept ? "AND ui.department='" + dept + "'" : ""}
            ORDER BY send_time DESC
        `);
        return sum.rows;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch detection data.");
    }
};

export async function fetchTodayTotalPageSum(
    client: Pool,
) {
    try {
        const todayPages = await client.query(`
            SELECT SUM(total_pages)
            FROM tbl_audit_job_log
            WHERE 1 =1 
            and send_time <> '0'
            and send_time BETWEEN TO_CHAR(DATE_TRUNC('day', NOW()), 'YYMMDD') || '000000'
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
            WHERE 1 = 1 
            and send_time <> '0'
            and send_time >= TO_CHAR(DATE_TRUNC('day',  - INTERVAL '30 days'), 'YYMMDD') || '000000'
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
            WHERE 1 = 1 
            and send_time <> '0'
            and send_time >= TO_CHAR(DATE_TRUNC('day',  current_date - INTERVAL '1 month'), 'YYMMDD') || '000000'
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
            FROM   tbl_audit_job_log AS ajl
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
    currentPage: number,
    dateFrom : string|null,
    dateTo : string|null,
   
) {
    const offset = (currentPage - 1) * itemsPerPage;

    console.log(currentPage,itemsPerPage , offset);

    try {
        const auditLogs =
            query !== ""
                ? await client.query(`
            select a.job_log_id,
                a.job_type ,
                a.printer_serial_number ,
                a.job_id      ,
                b.full_name user_name ,
                a.destination ,
                a.send_time,
                a.file_name ,
                to_char(TO_TIMESTAMP(a.send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD HH24:MI:SS') send_date ,
                a.copies  ,
                a.original_pages ,
                CASE WHEN a.detect_privacy THEN 'Y' 
                ELSE 'N' 
                END AS detect_privacy,
                a.privacy_text,
                a.image_archive_path ,
                a.text_archive_path ,
                a.original_job_id  ,
                a.document_name,
                a.total_pages,
                a.color_total_pages
            from tbl_audit_job_log a
            left join tbl_user_info b on a.user_name = b.user_name
            WHERE 1 = 1
            and a.send_time <> '0'
            and (
                printer_serial_number ILIKE '${`%${query}%`}' OR
                b.full_name  ILIKE '${`%${query}%`}' OR
                document_name ILIKE '${`%${query}%`}' OR
                privacy_text ILIKE '${`%${query}%`}' 
                )		
             and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  >=  '${`${dateFrom}`}' 
             and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  <=  '${`${dateTo}`}' 	    
            ORDER BY send_time DESC
            LIMIT ${itemsPerPage} OFFSET ${offset}
            `)
                : await client.query(`
            select a.job_log_id,
                a.job_type ,
                a.printer_serial_number ,
                a.job_id      ,
                b.full_name user_name ,
                a.destination ,
                a.send_time,
                a.file_name ,
                to_char(TO_TIMESTAMP(a.send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD HH24:MI:SS') send_date ,
                a.copies  ,
                a.original_pages ,
                CASE WHEN a.detect_privacy THEN 'Y' 
                ELSE 'N' 
                END AS detect_privacy,
                a.privacy_text,
                a.image_archive_path ,
                a.text_archive_path ,
                a.original_job_id  ,
                a.document_name,
                a.total_pages,
                a.color_total_pages
            from tbl_audit_job_log a
            left join tbl_user_info b on a.user_name = b.user_name		
            WHERE 1 = 1
              and a.send_time <> '0'
              and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  >=  '${`${dateFrom}`}' 
              and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  <=  '${`${dateTo}`}' 	
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
    itemsPerPage: number,
    dateFrom : string|null,
    dateTo : string|null,
) {
    try {

        console.log('dateFrom',dateFrom, dateTo, query);
        const count =
            query !== ""
                ? await client.query(`
                SELECT COUNT(*) FROM tbl_audit_job_log
                 WHERE 1 = 1
                  and send_time <> '0'
                  and (
                        printer_serial_number ILIKE '${`%${query}%`}' OR
                        user_name ILIKE '${`%${query}%`}' OR
                        document_name ILIKE '${`%${query}%`}' OR
                        privacy_text ILIKE '${`%${query}%`}'                        
                    )
                 and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  >=  '${`%${dateFrom}%`}' 
                 and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  <=  '${`%${dateTo}%`}'                     
            `)
                : await client.query(`
                SELECT COUNT(*) FROM tbl_audit_job_log 
                 WHERE  1 = 1
                 and send_time <> '0'
                 and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  >=  '${`%${dateFrom}%`}' 
                 and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  <=  '${`%${dateTo}%`}'                 
            `);

        const totalPages = Math.ceil(Number(count.rows[0].count) / itemsPerPage);
        console.log('totalPages', totalPages);
        return totalPages;
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch audit logs");
    }
};

export async function fetchFilteredRetiredAuditLogs(
    client: Pool,
    query: string,
    itemsPerPage: number,
    currentPage: number,
    dateFrom : string|null,
    dateTo : string|null,
   
) {
    const offset = (currentPage - 1) * itemsPerPage;
    try {
        const auditLogs =
            await client.query(`
            select a.job_log_id,
                a.job_type ,
                a.printer_serial_number ,
                a.job_id      ,
                b.full_name user_name ,
                a.destination ,
                a.send_time,
                a.file_name ,
                to_char(TO_TIMESTAMP(a.send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD HH24:MI:SS') send_date ,
                a.copies  ,
                a.original_pages ,
                CASE WHEN a.detect_privacy THEN 'Y' 
                ELSE 'N' 
                END AS detect_privacy,
                a.privacy_text,
                a.image_archive_path ,
                a.text_archive_path ,
                a.original_job_id  ,
                a.document_name,
                a.total_pages,
                a.color_total_pages
            from tbl_audit_job_log a
            left join tbl_user_info b on a.user_name = b.user_name
            WHERE 1 = 1
            and b.send_time <> '0'
            and (
                printer_serial_number ILIKE '${`%${query}%`}' OR
                b.full_name  ILIKE '${`%${query}%`}' OR
                document_name ILIKE '${`%${query}%`}' OR
                privacy_text ILIKE '${`%${query}%`}' 
                )	
             and b.deleted = 'Y'	
             and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  >=  '${`${dateFrom}`}' 
             and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  <=  '${`${dateTo}`}' 	    
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

export async function fetchFilteredRetiredAuditLogPages(
    client: Pool,
    query: string,
    itemsPerPage: number,
    dateFrom : string|null,
    dateTo : string|null,
) {
    try {
        const count =
                await client.query(`
                SELECT COUNT(*) FROM tbl_audit_job_log a
                left join tbl_user_info b on a.user_name = b.user_name
                 WHERE 1 = 1
                 and send_time <> '0'
                 and (
                        a.printer_serial_number ILIKE '${`%${query}%`}' OR
                        b.full_name ILIKE '${`%${query}%`}' OR
                        a.document_name ILIKE '${`%${query}%`}' OR
                        a.privacy_text ILIKE '${`%${query}%`}'                        
                    )
                 and b.deleted = 'Y'   
                 and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  >=  '${`%${dateFrom}%`}' 
                 and TO_CHAR(TO_TIMESTAMP(send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD')  <=  '${`%${dateTo}%`}'                     
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
            WHERE 1 =1 
             and send_time <> '0'
             and user_name='${userName}'
        `);
        return result.rows[0];
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Failed to fetch usage status by user");
    }
};

export async function fetchPrivacyDetectInfoByUsers(client: Pool, period: string, periodStart?:string, periodEnd?:string, dept?:string, user?:string) {
    let startDate = periodStart?? "";
    const endDate = periodEnd?? "";

    if(period !== 'specified') {
        const now = new Date();
        const startTime = new Date();

        if(period === 'today') {
            startDate = formatTimeYYYYpMMpDD(now);
        } else if(period === 'week') {
            startTime.setDate(now.getDate() - 6);
        } else if(period === 'month') {
            startTime.setMonth(now.getMonth() - 1);
        }
        startDate = formatTimeYYYYpMMpDD(startTime);
    }

    try {
        const response = await client.query(`
            SELECT
                pav.user_id,
                pav.user_name,
                pav.external_user_name,
                di.dept_name,
                sum(pav.detect_privacy_count) as detect_privacy_count,
                sum(pav.total_count) as total_count,
                ROUND(SUM(pav.detect_privacy_count)::numeric / SUM(total_count) * 100, 2)  || '%' as percent_detect
            FROM tbl_privacy_audit_v pav
            JOIN tbl_dept_info di ON pav.department = di.dept_id
            WHERE send_date >= '${startDate}'
            ${endDate !== "" ? "AND send_date <= '" + endDate + "'" : ""}
            ${!!dept ? "AND di.dept_name = '" + dept + "'" : ""}
            ${!!user ? "AND (pav.user_id like '%" + user + "%' OR pav.user_name like '%"+ user +"%')" : ""}
            GROUP BY user_id, user_name, external_user_name, dept_name
            ORDER BY detect_privacy_count DESC
        `);
        return response.rows;
    } catch (e) {
        console.log('fetchPrivacyDetectInfoByUsers :', e);
        return [];
    }
};

export async function fetchPrintInfoByQuery(client: Pool, periodStart:string, periodEnd:string, dept?:string, user?:string, device?:string) {
    try {
        const response = await client.query(`
            SELECT
            *
            FROM (
                SELECT
                    ui.user_name,
                    ui.external_user_name,
                    di.dept_name,
                    ajl.job_type,
                    ajl.total_pages,
                    ajl.color_total_pages,
                    dv.device_id,
                    dv.device_name,
                    TO_CHAR(TO_TIMESTAMP(ajl.send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD') AS send_date
                FROM tbl_audit_job_log ajl
                JOIN tbl_user_info ui ON ui.user_name = ajl.user_name
                JOIN tbl_device_info dv ON dv.device_id = ajl.device_id
                LEFT JOIN tbl_dept_info di ON di.dept_id = ui.department
                where 1 = 1
                and ajl.send_time <> '0'
            ) sub
            WHERE send_date>='${periodStart}' AND send_date<='${periodEnd}'
            ${!!dept ? "AND dept_name = '" + dept + "'" : ""}
            ${!!user ? "AND (user_name like '%" + user + "%' OR external_user_name like '%"+ user +"%')" : ""}
            ${!!device ? "AND device_name like '%" + device + "'" : ""}
            ORDER BY total_pages DESC
        `);
        return response.rows;
    } catch (e) {
        console.log('fetchPrintInfoByQuery :', e);
        return [];
    }
}


export async function fetchPrivacyInfoByQuery(client: Pool, periodStart:string, periodEnd:string, dept?:string, user?:string) {
    const splittedStart = periodStart.split('.');
    const startTime = splittedStart.at(0)?.slice(-2) + splittedStart.at(1) + splittedStart.at(2) + "00000000";
    const splittedEnd = periodEnd.split('.');
    const endTime = splittedEnd.at(0)?.slice(-2) + splittedEnd.at(1) + splittedEnd.at(2) + "23595999";

    try {
        const response = await client.query(`
            SELECT
            *
            FROM (
                SELECT
                    ajl.send_time,
                    ui.user_name,
                    ui.external_user_name,
                    ajl.document_name,
                    ajl.status,
                    di.dept_name
                FROM tbl_audit_job_log ajl
                JOIN tbl_user_info ui ON ui.user_name = ajl.user_name
                LEFT JOIN tbl_dept_info di ON di.dept_id = ui.department
                where 1 = 1
                  and ajl.send_time <> '0'
            ) sub
            WHERE send_time >= '${startTime}' AND send_time <= '${endTime}'
            ${!!dept ? "AND dept_name = '" + dept + "'" : ""}
            ${!!user ? "AND (user_name like '%" + user + "%' OR external_user_name like '%"+ user +"%')" : ""}
            ORDER BY send_time DESC
        `);
        return response.rows;
    } catch (e) {
        console.log('fetchPrintInfoByQuery :', e);
        return [];
    }
}
