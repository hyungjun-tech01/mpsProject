'use server';

import type { Pool } from 'pg';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';


export type PrintState = {
    errors?: {
        userName?: string[];
    };
    message?: string | null;
};

const PrintFormSchema = z.object({
    
});

export async function deleteAll(client: Pool, prevState: PrintState, formData: FormData) {
}

export async function deleteChecked(client: Pool, prevState: PrintState, formData: FormData) {
}

export async function printAll(client: Pool, prevState: PrintState, formData: FormData) {
}

export async function printChecked(client: Pool, prevState: PrintState, formData: FormData) {
}