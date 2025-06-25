import * as crypto from 'crypto';  // 암호화 모듈 추가 

// AES 암호화 설정
const algorithm = process.env.CRYPTO_ALGORITHM; // 암호화 알고리즘
const key = process.env.CRYPTO_PASSWORD; // 32 바이트 키 (aes-256)
const iv = process.env.CRYPTO_IV; // 16 바이트 IV

// 암호화 함수
export function encrypt(text: string | null): string {

    if (!algorithm || !key || !iv || !text) {
        return 'error=-encypt';
    }
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
}

// 복호화 함수
export function decrypt(encryptedText: string): string {
    if (!algorithm || !key || !iv) {
        return 'error=-decypt';
    }

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}