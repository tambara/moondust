import { hc } from "hono/client";
import type { AppType } from "../../workers/app";

export const app = hc<AppType>("/");
