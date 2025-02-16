import NextAuth from 'next-auth';
import { authConfig } from '../../../auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import pg from 'pg';
import type { UserAttr } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';


const client = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS,
});

async function getUser(id: string): Promise<UserAttr | undefined> {
    try {
      const user = await client.query<UserAttr>(`
        SELECT
            u.user_name,
            ua.attrib_value
        FROM tbl_user_attribute ua
        JOIN tbl_user u ON u.user_id=ua.user_id
        WHERE ua.user_name='${id}' AND ua.attrib_name='internal_password'`);
      return user.rows[0];
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
  }

await client.connect();

export const { auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ id: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { id, password } = parsedCredentials.data;
                    const user = await getUser(id);
                    if (!user) return null;

                    const userPassword = user.attrib_value.split(':')[1];

                    const passwordsMatch = await bcrypt.compare(password, userPassword);
 
                    if (passwordsMatch) return user;
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});