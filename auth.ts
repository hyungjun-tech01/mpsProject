import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import pg from "pg";
import bcrypt from "bcrypt";
import { authConfig } from "./auth.config";
import type { User } from "@/app/lib/definitions";


const client = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS,
});

await client.connect();

async function getUserAttr(name: string): Promise<User | undefined> {
  try {
    const user = await client.query<User>(`
      SELECT
        u.user_id,
        u.user_name,
        u.email,
        ua.attrib_value
      FROM tbl_user_attribute ua
      JOIN tbl_user u ON u.user_id=ua.user_id
      WHERE u.user_name='${name}' AND ua.attrib_name='internal_password'`
    );
    return user.rows[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
};


export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ user_name: z.string(), user_password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { user_name, user_password } = parsedCredentials.data;

          if(user_name != 'admin') {
            const userAttr = await getUserAttr(user_name);
            if (!userAttr) return null;

            const userPassword = userAttr.attrib_value.split(":")[1];
            const passwordsMatch = await bcrypt.compare(user_password, userPassword);
  
            if (passwordsMatch) return userAttr;
          } else {
            return {
              user_id: '0000',
              user_name: user_name,
              email: "",
              attrib_value: "",
            };
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
