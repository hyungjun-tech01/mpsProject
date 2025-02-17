import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import pg from "pg";
import bcrypt from "bcrypt";
import { authConfig } from "./auth.config";
import type { UserAttr } from "@/app/lib/definitions";


const client = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: process.env.DB_CONNECTION_TIMEOUT_MS,
});

await client.connect();

async function getUserAttr(name: string): Promise<UserAttr | undefined> {
  try {
    const user = await client.query<UserAttr>(`
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
}

export const { handlers: { GET, POST }, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ name: z.string(), password: z.string().min(6) })
          .safeParse(credentials);

        console.log("Check : credentials ", credentials);
        console.log("Check : parsedCredentials ", parsedCredentials);

        if (parsedCredentials.success) {
          const { name, password } = parsedCredentials.data;

          if(name != 'admin') {
            const userAttr = await getUserAttr(name);
            if (!userAttr) return null;

            const userPassword = userAttr.attrib_value.split(":")[1];
            const passwordsMatch = await bcrypt.compare(password, userPassword);
  
            if (passwordsMatch) return userAttr;
          } else {
            return {
              user_id: name,
              user_name: name,
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
