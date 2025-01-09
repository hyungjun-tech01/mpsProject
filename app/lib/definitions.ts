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
  company_name: string;
  company_name_en: string | null;
  ceo_name: string | null;
  business_registration_code: string | null;
  company_address: string | null;
  company_zip_code: string | number | number;
  company_phone_number: string | null;
  company_fax_number: string | null;
  homepage: string | null;
  company_scale: string | null;
  deal_type: string | null;
  industry_type: string | null;
  business_type: string | null;
  business_item: string | null;
  establishment_date: string | null;
  site_id: string | null;
  account_code: string | null;
  bank_name: string | null;
  account_owner: string | null;
  sales_resource: string | null;
  application_engineer: string | null;
  region: string | null;
  memo: string | null;
}


// ----- Begin : User ----------------------------------------//
export type SalespersonField = {
  userId: string;
  userName: string;
}

