import { WorkerEntrypoint } from "cloudflare:workers";
import { createDb } from "~/db";
import { pages } from "~/db/schema";

export class ScriptAPI extends WorkerEntrypoint {
  async listPages(options: { limit?: number }) {
    const db = createDb(this.env.pages);

    return db.select()
      .from(pages)
      .limit(options.limit ?? 10);
  }
}