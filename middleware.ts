import type { NextRequest } from 'next/server';
import { i18nRouter } from 'next-i18n-router';
import i18nConfig from './i18nConfig';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';


const { auth } = NextAuth(authConfig)


export default auth(async function middleware(request: NextRequest) {
  return i18nRouter(request, i18nConfig);
});


// only applies this middleware to files in the app directory
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)'
};