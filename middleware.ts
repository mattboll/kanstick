export { auth as middleware } from "@/auth";
// TODO : we want security for uploaded files too
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|static/).*)"],
};
