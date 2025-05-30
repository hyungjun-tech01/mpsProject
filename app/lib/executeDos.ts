import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function executeDos(command: string) {
    try {
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr) {
            return NextResponse.json({ error: stderr }, { status: 500 });
        }
        
        return NextResponse.json({ result: stdout });
    } catch (error) {
        return NextResponse.json(
            { error: '명령어 실행 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}