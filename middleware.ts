import { NextResponse } from "next/server";
import { i18nMiddleware } from "./i18nMiddleware";
import authConfig from "./auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth({
  ...authConfig,
});

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  if (
    !isAuthenticated &&
    req.nextUrl.pathname !== "/" &&
    req.nextUrl.pathname !== "/fr" &&
    req.nextUrl.pathname !== "/en"
  )
    return Response.redirect(new URL("/", req.url));

  const i18nResponse = i18nMiddleware(req);
  if (i18nResponse.status !== 200) {
    return i18nResponse;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|static/).*)"],
};
