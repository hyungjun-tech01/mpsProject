import { i18nRouter } from 'next-i18n-router';
import i18nConfig from './i18nConfig';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';


export default NextAuth(authConfig).auth;

export function middleware(request) {
  return i18nRouter(request, i18nConfig);
};

// only applies this middleware to files in the app directory
export const config = {
  matcher: ['/((?!api|static|.*\\..*|_next).*)',
    '/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};