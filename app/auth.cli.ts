import { getPlatformProxy } from "wrangler";
import { createAuth } from "./lib/auth.server";

const platform = await getPlatformProxy<Env>({
  configPath: "./wrangler.jsonc",
  remoteBindings: false,
});

export const auth = createAuth(platform.env);