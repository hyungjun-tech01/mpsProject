import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { existsSync } from 'fs';

export async function GET(
    req: NextRequest
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

  try {
    const algorithm = process.env.CRYPTO_ALGORITHM;
    const encryptedFilePath = path.join(process.cwd(), filePath);

    let key = Buffer.alloc(32);
    Buffer.from(process.env.CRYPTO_PASSWORD).copy(key);

    if (fs.existsSync(encryptedFilePath)) {
      const encryptedData = fs.readFileSync(encryptedFilePath);

      let iv = Buffer.alloc(16);
      Buffer.from(process.env.CRYPTO_IV).copy(iv);

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.setAutoPadding(true);

      const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

      const response = new NextResponse(decryptedData);
      response.headers.set('Content-Disposition', 'attachment; filename="decrypted.PDF"');
      response.headers.set('Content-Type', 'application/pdf');
      return response;
    } else {
      return new NextResponse(JSON.stringify({ error: 'File not found' }), { status: 404 });
    }
  } catch (err) {
    console.error(err.message);
    return new NextResponse(JSON.stringify({ error: err.message }), { status: 500 });
  }
}