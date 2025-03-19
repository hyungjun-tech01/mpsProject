import { type NextRequest } from 'next/server'
import { readFile  } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const contentTypeFromExt = {
    txt : 'text/plain',
    pdf : 'application/pdf',
    epdf: 'file/pdf',
    jpg : 'image/jpeg',
    png : 'image/png',
}

export async function GET(
    req: NextRequest,
) {
    const searchParams = req.nextUrl.searchParams;
    const filename = searchParams.get('filename');
    console.log("Check Request :", filename);

    if(!filename) {
        return new Response('Wrong query', {
            status: 400,
            statusText: "Bad Reqeust"
        })
    };

    const filePath = path.join(process.cwd(), 'upload', filename);

    if (!existsSync(filePath)) {
        return new Response('File is Not Found', {
            status: 404,
            statusText: "Not Found"
        })
    };

    const fileExt = filename.split(".").at(-1);
    const contentType = contentTypeFromExt[fileExt] || 'iamge/png';

    const buffer = await readFile(filePath);

    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename="${filename}"`);
    headers.append('Content-Type', contentType);

    return new Response(buffer, {
        headers,
    });
}