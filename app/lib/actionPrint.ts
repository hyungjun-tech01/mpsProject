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


export async function deleteSelected(client: Pool, list: string[]) {
}

export async function printSelected(client: Pool, list: string[]) {
}