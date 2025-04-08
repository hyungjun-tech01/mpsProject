export interface ISearch {
  query?: string;
  itemsPerPage?: string;
  page?: string;
};

export interface IGroupSearch {
  queryOutGroup?: string;
  queryInGroup?: string;
  itemsPerPage?: string;
  outGroupPage?: string;
  inGroupPage?: string;
};

export type IBreadCrums = {
  label: string;
  link: string;
};

export type IColumnData = {
  name: string;
  title: string | React.JSX.Element;
  type?: string;
  values?: object;
  align?: 'right' | 'center' | 'left' | 'justify' | 'inherit';
};

// ----- Begin : User ----------------------------------------//
export type User = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  password: string;
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

export type Group = {
  group_id: string;
  group_name: string;
  group_type: 'device' | 'user' | 'security';
  group_notes: string;
  schedule_period: 'NONE' | 'PER_DAY' | 'PER_WEEK' | 'PER_MONTH' | 'PER_YEAR';
  schedule_amount: number;
  schedule_start: number;
}

export type UserGroup = {
  id: string;
  name: string;
  full_name: string;
  balance: number;
  restricted: 'Y' | 'N';
  total_pages: number;
  total_jobs: number;
}
// ----- End : User ------------------------------------------//

export type SecurityGroup = {
  id: string;
  name: string|null;
  dept_name: string;
};

export type DeviceGroup = {
  id: string;
  name: string|null;
  device_type: string|null;
  device_status: string|null;
  location: string | null;
  notes: string | null;
  ext_device_function: string | null;
  physical_device_id: string | null;
  device_model: string | null;
  serial_number: string | null;
  deleted: string | null;
};

export type Device = {
  id: string|null;
  device_id: string|null;
  device_name: string|null;
  device_type: string|null;
  device_status: string|null;
  location: string | null;
  notes: string | null;
  ext_device_function: string | null;
  physical_device_id: string | null;
  device_model: string | null;
  serial_number: string | null;
  deleted: string | null;
  app_type: string | null;
  cyan_toner_percentage: string | null;
  magenta_toner_percentage: string | null;
  yellow_toner_percentage: string | null;
  black_toner_percentage: string | null;
};

export type FaxLineInfo = {
  fax_line_id: string|null,
  fax_line_name: string|null,
  fax_line_user_id: string|null,
  fax_line_shared_group_id: string|null,
  printer_id : string|null,
}

export type AuditLogField ={
  id: string|null;
  job_log_id: string|null;
  job_type: string|null;
  printer_serial_number: string|null;
  job_id: string|null;
  user_name: string|null;
  destination: string|null;
  send_time: string|null;
  file_name: string|null;
  send_date: string|null;
  copies: number|null;
  original_pages: number|null;
  privacy_text: string|null;
  image_archive_path: string|null;
  text_archive_path: string|null;
  original_job_id: string|null;
  document_name: string|null;
  total_pages: number|null;
  color_total_pages: number|null;
};

export type Fax ={
  fax_line_id: string|null;
  fax_line_name: string|null;
  printer_id: string|null;
  fax_line_user_id: string|null;
  fax_line_shared_group_id: string|null;
  created_date: Date|null;
  created_by: string|null;
  deleted_date: Date|null;
  deleted_by: string|null;
};