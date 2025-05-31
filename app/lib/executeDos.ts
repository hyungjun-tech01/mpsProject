'use server'

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function executeDos(prevState: any, formData: FormData) {
    try {
        const command = formData.get('command') as string;

        if (!command) {
            return { status: 'error', message: '명령어가 전달되지 않았습니다.' };
        }

        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            return { status: 'error', message: stderr };
        }
        
        return { status: 'success', message: stdout };
    } catch (error) {
        return { status: 'error', message: '명령어 실행 중 오류가 발생했습니다.' };
    }
}