"use server"

import { signIn, signOut } from "@/app/lib/auth"

 export async function handleGoogleSignIn() {
  await signIn("google", {
    redirectTo: "/dashboard",
  });
}

export  async function handleGoogleSignOut() {
   await signOut({
    redirectTo: "/login"
   });
 }