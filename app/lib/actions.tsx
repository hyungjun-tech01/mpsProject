'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { signIn } from '@/auth';
// import { AuthError } from 'next-auth';


export type State = {
    errors?: {
        action_type: 'ADD' | 'UPDATE' | 'DELETE';
        company_code?: string[];
        modify_user?: string[];
    };
    message?: string | null;
};

const FormSchema = z.object({
    company_name: z.string({
        invalid_type_error: 'Company name must be set',
    }),
    company_name_en: z.string(),
    amount: z.coerce.number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
});

const CreateCompany = FormSchema.omit({ id: true, date: true });

export async function createCompany(prevState: State, formData: FormData) {
    const validatedFields = CreateCompany.safeParse({
        companyName: formData.get('companyName'),
        companyNameEn: formData.get('companyNameEn'),
        ceoName: formData.get('ceoName'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Company.',
        };
    }

    // Prepare data for insertion into the database
    const { companyName, companyNameEn, ceoName } = validatedFields.data;

    try {
        fetch()
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    revalidatePath('/company');
    redirect('/company');
}