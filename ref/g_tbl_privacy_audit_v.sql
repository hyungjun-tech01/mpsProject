drop view tbl_privacy_audit_v;

create or replace view tbl_privacy_audit_v as (
    SELECT 
        send_date, 
        user_name,
        user_id,
        external_user_name, 
        department, 
        dept_id,
        SUM(detect_privacy_count) AS detect_privacy_count,
        SUM(total_count) AS total_count
    FROM (
        SELECT 
            TO_CHAR(TO_TIMESTAMP(t.send_time, 'YYMMDDHH24MISS'), 'YYYY.MM.DD') AS send_date,
            t1.user_name,
            t1.user_id,
            t1.full_name external_user_name,
            t2.dept_name department,
            t2.dept_id dept_id,
            CASE 
            WHEN t.detect_privacy = true THEN 1 
            ELSE 0 
            END AS detect_privacy_count,
            1 AS total_count
        FROM tbl_audit_job_log t
        JOIN tbl_user_info t1 ON t.user_name = t1.user_name
        LEFT JOIN tbl_dept_info t2 on t1.department = t2.dept_id
        where t.send_time <> '0'
    ) sub
    GROUP BY 
        send_date,
        user_name,
        user_id,
        external_user_name, 
        department,
        dept_id
);


-- 샘플 쿼리 
select user_name, external_user_name, department, sum(detect_privacy_count) as detect_privacy_count, 
sum(total_count) as total_count,
ROUND(SUM(detect_privacy_count)::numeric / SUM(total_count) * 100, 2)  || '%' as percent_detect
from tbl_privacy_audit_v
where send_date >= '2024.04.01'
and send_date <= '2024.10.31'  
group by user_name, external_user_name, department
order by  percent_detect desc
