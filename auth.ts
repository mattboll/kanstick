import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import authConfig from "./auth.config";
import pool from "./lib/db";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  ...authConfig,
});
