
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { createDb } from "~/db";
import * as schema from "~/db/schema";

export function createAuth(env: Env) {
  const db = createDb(env.pages);
  return betterAuth({
    basePath: "/auth",
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),


    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,

    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
    },

    plugins: [
      admin(),
    ],
  });
}
