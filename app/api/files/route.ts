import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
    console.log('Check : here');
    const buffer = await readFile(path.join(process.cwd(), '/upload', '20230702_181049.jpg'));

    const headers = new Headers();
    headers.append('Content-Disposition', 'attachment; filename="20230702_181049.jpg"');
    headers.append('Content-Type', 'image/jpeg');
  
    return new Response(buffer, {
      headers,
    });
  }