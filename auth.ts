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
        u.user_id id,
        u.user_name name,
        u.user_role role,
        u.email email,
        u.password password
      FROM tbl_user_info u
      WHERE u.user_name='${name}'`
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

          // console.log(`Credential : (id) ${user_name} / (pwd) ${user_password}`);

          // if(user_name != 'admin') {
            const userAttr = await getUserAttr(user_name);
            if (!userAttr) return null;

            const userPassword = userAttr.password;
            const passwordsMatch = await bcrypt.compare(user_password, userPassword);
  
            if (passwordsMatch)
              return {
                id: userAttr.id,
                name: userAttr.name,
                email: userAttr.email,
                role: userAttr.role ?? "user",
                image: ""
              };
          // } else {
          //   return {
          //     id: '0001',
          //     name: user_name,
          //     email: "",
          //     image: ""
          //   };
          // }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  // callbacks: {
  //   session({ session, user }) {
  //     session.user.role = user.role
  //     return session
  //   }
  // }
});
