-- test data 
insert into tbl_user_info_if( user_name            ,
                    external_user_name ,
                    full_name          ,
                    email              ,
                    notes              ,
                    created_date       ,
                    created_by         ,
                    user_source_type   ,
                    modified_date      ,
                    modified_by        ,
                    department         ,
                    office             ,
                    card_number        ,
                    card_number2       ,
                    home_directory     ,
                    privilege         ,
							if_status)
values(
'test_hjkim',
'김형준' ,
                    '김형준'          ,
                    'hjkim@hjkim.com'  ,
                    null              ,
                    now()       ,
                    'admin'         ,
                    'WEB'   ,
                    null      ,
                    null        ,
                    'IT'         ,
                    'IT'             ,
                    '1234'        ,
                    '2345'       ,
                    'home'    ,
                    'COLOR_COPY' ,
	'INPUT'
)		;		

-- create user procedure 
drop procedure if exists p_create_user_if;

CREATE OR REPLACE PROCEDURE p_create_user_if(i_user_info_if_id in text,
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
   v_dept_id varchar(100);
   v_success_count integer := 0;
   v_error_count integer := 0;
   v_error_messages text := '';  
BEGIN

    -- 혹시 성공한 데이터가 있다면 삭제 처리 
    delete from tbl_user_info_if
    where if_status = 'SUCCESS';

    FOR TARGET_CURSOR IN
                SELECT   *
                FROM     tbl_user_info_if t
                WHERE  t.if_status IN ('INPUT', 'ERROR')
                and user_info_if_id =  COALESCE(i_user_info_if_id, user_info_if_id)
            LOOP
                -- validate_logic;
                -- 에러 상태가 들어 왔다면 
                if TARGET_CURSOR.if_status = 'ERROR' then 
                    v_error_count := v_error_count + 1;
                    v_error_messages := v_error_messages || ' ERROR 상태인 데이터는 처리할수 없습니다, 해당 데이터 삭제 후 다시 작업하세요: ' || 
                              TARGET_CURSOR.user_name || '; ';  -- 메시지 누적
                    CONTINUE;  -- 현재 레코드 건너뛰고 다음 레코드 처리
                end if;
                
                -- 중복 체크
                SELECT EXISTS (
                    SELECT 1 
                    FROM tbl_user_info 
                    WHERE user_name = TARGET_CURSOR.user_name
                ) INTO v_exists;

                IF v_exists THEN
                    v_error_count := v_error_count + 1;
                    v_error_messages := v_error_messages || ' 이미 존재하는 사용자입니다: ' || 
                              TARGET_CURSOR.user_name || '; ';  -- 메시지 누적

                    update tbl_user_info_if 
                    set if_status = 'ERROR', if_message = ' 이미 존재하는 사용자입니다: ' ||TARGET_CURSOR.user_name
                    where user_info_if_id = TARGET_CURSOR.user_info_if_id;

                    CONTINUE;  -- 현재 레코드 건너뛰고 다음 레코드 처리
                END IF;

                -- DEPT 부서 체크 
                SELECT EXISTS (
                    SELECT 1 
                    FROM tbl_dept_info 
                    WHERE dept_name = TARGET_CURSOR.department
                ) INTO v_dept_exists;
                
                IF not v_dept_exists then 
                    v_error_count := v_error_count + 1;
                    v_error_messages := v_error_messages || TARGET_CURSOR.department||' 존재하지 않는 부서입니다: ' || 
                              TARGET_CURSOR.user_name || '; ';  -- 메시지 누적

                    update tbl_user_info_if 
                    set if_status = 'ERROR', if_message = '존재하지 않는 부서입니다: ' ||TARGET_CURSOR.user_name
                    where user_info_if_id = TARGET_CURSOR.user_info_if_id;

                    CONTINUE;  -- 현재 레코드 건너뛰고 다음 레코드 처리
                END IF;

                BEGIN
                    SELECT dept_id 
                      INTO v_dept_id
                    FROM tbl_dept_info 
                    WHERE dept_name = TARGET_CURSOR.department;

                    insert into tbl_user_info(
                        user_name            ,
                        external_user_name ,
                        full_name          ,
                        email              ,
                        notes              ,
                        created_date       ,
                        created_by         ,
                        user_source_type   ,
                        modified_date      ,
                        modified_by        ,
                        department         ,
                        office             ,
                        card_number        ,
                        card_number2       ,
                        home_directory     ,
                        privilege         
                    ) values(
                        TARGET_CURSOR.user_name            ,
                        TARGET_CURSOR.external_user_name ,
                        TARGET_CURSOR.full_name          ,
                        TARGET_CURSOR.email              ,
                        TARGET_CURSOR.notes              ,
                        TARGET_CURSOR.created_date       ,
                        TARGET_CURSOR.created_by         ,
                        TARGET_CURSOR.user_source_type   ,
                        TARGET_CURSOR.modified_date      ,
                        TARGET_CURSOR.modified_by        ,
                        v_dept_id                        ,
                        TARGET_CURSOR.office             ,
                        TARGET_CURSOR.card_number        ,
                        TARGET_CURSOR.card_number2       ,
                        TARGET_CURSOR.home_directory     ,
                        TARGET_CURSOR.privilege         
                    );
                    v_success_count := v_success_count + 1;

                    update tbl_user_info_if 
                    set if_status = 'SUCCESS'
                    where user_info_if_id = TARGET_CURSOR.user_info_if_id;

                EXCEPTION
                    WHEN OTHERS THEN
                        v_error_count := v_error_count + 1;
                        v_error_messages := v_error_messages || '사용자 생성 중 오류 발생: ' || 
                                  TARGET_CURSOR.user_name || ' - ' || SQLERRM || '; ';
                END;                
			END LOOP;	
    
    -- 성공한 데이터는 삭제 처리 
    delete from tbl_user_info_if
    where if_status = 'SUCCESS';
    
    -- 최종 결과 메시지 생성
    IF v_success_count > 0 AND v_error_count = 0 THEN
        x_result := 'SUCCESS';
        x_result_msg := '사용자 생성이 완료되었습니다. (총 ' || v_success_count || '건)';
    ELSIF v_success_count > 0 AND v_error_count > 0 THEN
        x_result := 'ERROR';
        x_result_msg := '일부 사용자 생성이 완료되었습니다. (성공: ' || v_success_count || 
                        '건, 실패: ' || v_error_count || '건) 실패사유: ' || v_error_messages;
    ELSIF v_success_count = 0 AND v_error_count > 0 THEN
        x_result := 'ERROR';
        x_result_msg := '사용자 생성이 실패했습니다. 실패사유: ' || v_error_messages;
    ELSE
        x_result := 'ERROR';
        x_result_msg := 'ERROR 상태인 데이터는 처리할 수 없습니다. 해당 데이터를 삭제 후 다시 작업 하세요.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        x_result := 'ERROR';
        x_result_msg := '시스템 오류가 발생했습니다: ' || SQLERRM;
END;
$$;           


-- 테스트 
DO $$
DECLARE
    v_result text;
    v_result_msg text;
BEGIN
    CALL p_create_user_if(null, v_result, v_result_msg);
    RAISE NOTICE 'Result: %, Message: %', v_result, v_result_msg;
END;
$$;