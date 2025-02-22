import nextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, auth, signIn, signOut } = nextAuth({
  debug: process.env.NODE_ENV === "development",
  providers: [Keycloak],
});
