"use server";

import { redirect } from "next/navigation";
import { signOutCurrentSession } from "./session";

export async function signOut(): Promise<never> {
  await signOutCurrentSession();
  redirect("/");
}
