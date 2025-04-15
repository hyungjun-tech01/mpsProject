import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcrypt";
import MyDBAdapter from '@/app/lib/adapter';

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}


export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ user_name: z.string(), user_password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { user_name, user_password } = parsedCredentials.data;

          // console.log(`Credential : (id) ${user_name} / (pwd) ${user_password}`);
          const adapter = MyDBAdapter();
          const userAttr = await adapter.getAccount(user_name);
          console.log('Account : ', userAttr);
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
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      // check login --------------------------------------------
      const isLoggedIn = !!auth?.user;
      const isOnProtected = !(nextUrl.pathname.startsWith('/login'));
      if (isOnProtected) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/login', nextUrl));
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // check admin --------------------------------------------
      const isAdmin = auth?.user.role === "admin";
      const onlyAdminPermitted = nextUrl.pathname.startsWith('/user');
      if(onlyAdminPermitted) {
        if(isAdmin) return true;
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    }
  }
});
