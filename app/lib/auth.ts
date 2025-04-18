import { FirestoreAdapter } from "@auth/firebase-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { firebaseCert } from "./firebase"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  adapter: FirestoreAdapter({
    credential: firebaseCert,
  }),
})
