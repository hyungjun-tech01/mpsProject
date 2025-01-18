export type IColumnData = {
  name: string;
  title: string;
  align?: 'right' | 'center' | 'left' | 'justify' | 'inherit';
}

// ----- Begin : User ----------------------------------------//
export type User = {
  userId: string,
  userName: string,
  password: string,
  mobileNumber: string | null | undefined,
  phoneNumber: string | null | undefined,
  department: string | null | undefined,
  position: string | null | undefined,
  email: string | null | undefined,
  private_group: string | null | undefined,
  memo: string | null | undefined,
  jobType: string | null | undefined,
  isWork: string | null | undefined,
  userRole: string | null | undefined,
};

export type UserField = {
  user_id: number | null;
  user_name: string | null;
  external_user_name: string | null;
  full_name: string | null;
  email: string | null;
  notes: string | null;
  total_jobs: number | null;
  total_pages: number | null;
  total_sheets: number | null;
  reset_by: string | null;
  reset_date: Date | null;
  deleted: boolean | null;
  deleted_date: Date | null;
  created_date: Date | null;
  created_by: string | null;
  modified_date: Date | null;
  modified_by: string | null;
  department: string | null;
  office: string | null;
  card_number: string | null;
  disabled_printing: string | null;
  disabled_printing_until: Date | null;
  net_reset_by: string | null;
  net_reset_date: Date | null;
  net_total_megabytes: string | null;
  net_total_time_hours: string | null;
  disabled_net: string | null;
  disabled_net_until: Date | null;
  internal: string | null;
  last_user_activity: string | null;
  card_number2: string | null;
  secondary_user_name: string | null;
  modified_ticks: number | null;
  home_directory: string | null;
  primary_user_source_type: string | null;
  secondary_user_source_type: string | null;
  secondary_external_user_name: string | null;
}


// ----- Begin : User ----------------------------------------//
export type SalespersonField = {
  userId: string;
  userName: string;
}

