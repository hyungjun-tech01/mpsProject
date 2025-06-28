-- create user procedure 
drop procedure if exists p_create_log;

CREATE OR REPLACE PROCEDURE p_create_log(i_log_key_name in varchar,
i_log_key_value in varchar,
i_log_table in varchar,
i_log_type in varchar,
i_created_by in varchar,
i_ip_address in varchar,
x_result out text,
x_result_msg out text
)
LANGUAGE plpgsql
AS $$
DECLARE
   v_if_status text;
   v_if_message text;
   TARGET_CURSOR record;
   v_exists boolean;
   v_dept_exists boolean;
   v_dept_id varchar(100) := null;
   v_success_count integer := 0;
   v_error_count integer := 0;
   v_error_messages text := '';  
BEGIN

   
    if (i_log_table === 'tbl_security_value_info' and i_log_type === 'delete'){
        select security_name||','||security_type||','||security_value 
        from tbl_security_value_info t 
        where t.security_value_id = i_log_key_value
        limit 1;
        insert into tbl_application_log_info ()
        values();

    }
    x_result := 'SUCCESS';
    x_result_msg := '';
EXCEPTION
    WHEN OTHERS THEN
        x_result := 'ERROR';
        x_result_msg := '시스템 오류가 발생했습니다: ' || SQLERRM;
END;
$$;          