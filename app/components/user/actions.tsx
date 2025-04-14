'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { signIn } from '@/auth';
// import { AuthError } from 'next-auth';
import { fetchCreateUser } from '@/app/lib/fetchUserData';


export type State = {
    errors?: {
        company_code?: string;
        salespersonId?: string;
        modify_user?: string;
    };
    message?: string | null;
};

const FormSchema = z.object({
    // company_name_en: z.string(),
    // amount: z.coerce.number()
    //     .gt(0, { message: 'Please enter an amount greater than $0.' }),
    // status: z.enum(['pending', 'paid'], {
    //     invalid_type_error: 'Please select an invoice status.',
    // }),
    // date: z.string(),
    company_name: z.string({
        invalid_type_error: 'Please enter company name',
    }),
    company_name_en: z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    ceo_name: z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    business_registration_code: z.union([z.union([z.string().nullish(), z.literal("")]), z.literal("")]),
    company_address: z.string({
        invalid_type_error: 'Please enter company address',
    }),
    company_zip_code: z.union([z.string().nullish(), z.literal("")]),
    company_phone_number: z.union([z.string().nullish(), z.literal("")]),
    company_fax_number: z.string({
        invalid_type_error: 'Please enter company fax number',
    }),
    homepage: z.union([z.string({
        invalid_type_error: 'Please enter homepage address of company',
    }).url({ message: 'Invalid url' }).nullish(), z.literal("")]),
    company_scale: z.union([z.string().nullish(), z.literal("")]),
    deal_type: z.union([z.string().nullish(), z.literal("")]),
    industry_type: z.union([z.string().nullish(), z.literal("")]),
    business_type: z.union([z.string().nullish(), z.literal("")]),
    business_item: z.union([z.string().nullish(), z.literal("")]),
    establishment_date: z.union([z.date({
        message: 'Invalid Date'
    }).nullish(), z.literal("")]),
    site_id: z.string({
        invalid_type_error: 'Please enter site id of company',
    }),
    account_code: z.union([z.string().nullish(), z.literal("")]),
    bank_name: z.union([z.string().nullish(), z.literal("")]),
    account_owner: z.union([z.string().nullish(), z.literal("")]),
    sales_resource: z.union([z.string().nullish(), z.literal("")]),
    application_engineer: z.union([z.string().nullish(), z.literal("")]),
    region: z.union([z.string().nullish(), z.literal("")]),
    memo: z.union([z.string().nullish(), z.literal("")]),
});

// const CreateUser = FormSchema.omit({ id: true, date: true });
const CreateUser = FormSchema;

export async function createUser(prevState: State, formData: FormData) {
    const validatedFields = CreateUser.safeParse({
        companyName: formData.get('company_name'),
        companyNameEn: formData.get('company_name_en'),
        ceoName: formData.get('ceo_name'),
        businessRegistrationCode: formData.get('business_registration_code'),
        companyAddress: formData.get('company_address'),
        companyZipCode: formData.get('company_zip_code'),
        companyPhoneNumber: formData.get('company_phone_number'),
        companyFaxNumber: formData.get('company_fax_number'),
        homepage: formData.get('homepage'),
        companyScale: formData.get('company_scale'),
        dealType: formData.get('deal_type'),
        industryType: formData.get('industry_type'),
        businessType: formData.get('business_type'),
        businessItem: formData.get('business_item'),
        establishmentDate: formData.get('establishment_date'),
        siteId: formData.get('site_id'),
        accountCode: formData.get('account_code'),
        bankName: formData.get('bank_name'),
        accountOwner: formData.get('account_owner'),
        salesResource: formData.get('sales_resource'),
        applicationEngineer: formData.get('application_engineer'),
        region: formData.get('region'),
        memo: formData.get('memo'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create User.',
        };
    }

    // Prepare data for insertion into the database
    const newCompany = validatedFields.data;

    const output = await fetchCreateUser(newCompany);
    if(!output.result) {
        return {
            errors: output.data,
            message: 'Failed to Create User',
        }
    }

    revalidatePath('/user');
    redirect('/user');
}