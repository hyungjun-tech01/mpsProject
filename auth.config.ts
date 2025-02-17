import type { NextAuthConfig } from 'next-auth';
import { UserAttr } from './app/lib/definitions';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token, user }) {
      session.user = token.user as UserAttr
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = !(nextUrl.pathname.startsWith('/login'));
      if (isOnProtected) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;