import { type NextRequest , NextResponse} from 'next/server';
import { readFile  } from 'fs/promises';
import { existsSync } from 'fs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const contentTypeFromExt = {
    txt : 'text/plain',
    pdf : 'application/pdf',
    epdf: 'file/pdf',
    jpg : 'image/jpeg',
    png : 'image/png',
}

async function handlePMGFileRequest(filename: string) {

    const filePath = path.join(process.cwd(), 'upload', filename);

    //console.log("handleRouteRequest :", filePath);

    if (!existsSync(filePath)) {
      // fallback 이미지 경로를 지정합니다.
      const fallbackPath = path.join(process.cwd(), 'public', 'fallback-image.png');
              
      // fallback 파일도 존재하지 않으면 404 에러를 반환합니다.
      if (!existsSync(fallbackPath)) {
        console.log('not extist fallback');
          return new Response('Fallback File Not Found', {
              status: 404,
              statusText: "Not Found"
          });
      }

      // fallback 파일을 읽습니다.
      const fallbackBuffer = await readFile(fallbackPath);

      const headers = new Headers();
      headers.append('Content-Type', 'image/png'); // 이미지 타입은 png로 설정

      // fallback 이미지를 성공(200 OK) 응답으로 반환합니다.
      return new Response(fallbackBuffer, {
          status: 200,
          headers,
      });
    };

    const fileExt = filename.split(".").at(-1);
    const contentType = contentTypeFromExt[fileExt as keyof typeof contentTypeFromExt] || 'image/png';

    const buffer = await readFile(filePath);

    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename="${filename}"`);
    headers.append('Content-Type', contentType);

    return new Response(buffer, {
        headers,
    });
}

async function handleDecryptPDFFileRequest(filepath: string) {
    try {
      const algorithm = process.env.CRYPTO_ALGORITHM;
      const cryptoPassword = process.env.CRYPTO_PASSWORD;
      const cryptoIV = process.env.CRYPTO_IV;
  
      if (!cryptoPassword || !cryptoIV || !algorithm) {
        throw new Error('Environment variables for decryption are not set properly.');
      }
      
  
      const encryptedFilePath = path.join(process.cwd(), 'upload', filepath);
  
      const key = Buffer.alloc(32);
      Buffer.from(cryptoPassword).copy(key);
  
      if (fs.existsSync(encryptedFilePath)) {
        const encryptedData = fs.readFileSync(encryptedFilePath);
  
        const iv = Buffer.alloc(16);
        Buffer.from(cryptoIV).copy(iv);
  
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
      // console.error(err.message);
      return new NextResponse(JSON.stringify({ error: err }), { status: 500 });
    }
  }
  
  async function handleDecryptTextFileRequest(filepath: string) {
    try {
      const algorithm = process.env.CRYPTO_ALGORITHM;
      const cryptoPassword = process.env.CRYPTO_PASSWORD;
      const cryptoIV = process.env.CRYPTO_IV;

      console.log("Decrypt Text File Request :", filepath);
  
      if (!cryptoPassword || !cryptoIV || !algorithm) {
        throw new Error('Environment variables for decryption are not set properly.');
      }
      
  
      const encryptedFilePath = path.join(process.cwd(), 'upload', filepath);
  
      const key = Buffer.alloc(32);
      Buffer.from(cryptoPassword).copy(key);
  
      if (fs.existsSync(encryptedFilePath)) {
        const encryptedData = fs.readFileSync(encryptedFilePath);
  
        const iv = Buffer.alloc(16);
        Buffer.from(cryptoIV).copy(iv);
  
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAutoPadding(true);
  
        const decryptedData = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
   
        const response = new NextResponse(decryptedData);
        response.headers.set('Content-Disposition', 'attachment; filename="decrypted.txt"');
        response.headers.set('Content-Type', 'application/plain');
        
        return response;
      } else {
        return new NextResponse(JSON.stringify({ error: 'File not found' }), { status: 404 });
      }
    } catch (err) {
      // console.error(err.message);
      return new NextResponse(JSON.stringify({ error: err }), { status: 500 });
    }
  }


  export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const filepath = searchParams.get('filepath');
    const filename = searchParams.get('filename');
    const textfilename = searchParams.get('textfilename');


    if (filename === null && filepath === null && textfilename === null) {
      return new NextResponse(JSON.stringify({ error: 'Invalid filepath or filename' }), { status: 400 });
    }
  


    if (filename !== null) {
        return await handlePMGFileRequest(filename);
    }
    if(filepath !== null) {
        return await handleDecryptPDFFileRequest(filepath);
    }
    if(textfilename !== null) {
      return await handleDecryptTextFileRequest(textfilename);
  }
    // if (filename === 'route') {
    //   return await handleRouteRequest(filepath);
    // } else if (filename === 'decryptFile') {
    //   return await handleDecryptFileRequest(filepath);
    // } else {
    //   return new NextResponse(JSON.stringify({ error: 'Unknown filename' }), { status: 400 });
    // }
  }

// export async function GET(
//     req: NextRequest,
// ) {
//     const searchParams = req.nextUrl.searchParams;
//     const filename = searchParams.get('filename');
//     console.log("Check Request :", filename);

//     if(!filename) {
//         return new Response('Wrong query', {
//             status: 400,
//             statusText: "Bad Reqeust"
//         })
//     };

//     const filePath = path.join(process.cwd(), 'upload', filename);

//     if (!existsSync(filePath)) {
//         return new Response('File is Not Found', {
//             status: 404,
//             statusText: "Not Found"
//         })
//     };

//     const fileExt = filename.split(".").at(-1);
//     const contentType = contentTypeFromExt[fileExt] || 'image/png';

//     const buffer = await readFile(filePath);

//     const headers = new Headers();
//     headers.append('Content-Disposition', `attachment; filename="${filename}"`);
//     headers.append('Content-Type', contentType);

//     return new Response(buffer, {
//         headers,
//     });
// }