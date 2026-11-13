import { env, WorkerEntrypoint } from "cloudflare:workers";

// export default {
// 	async fetch(request, env): Promise<Response> {
// 		const { code } = await request.json();

// 		const worker = env.LOADER.load({
//           env: {
//       WIKI: ctx.exports.WikiAPI(),
//     },

// 			compatibilityDate: "2026-05-01",
// 			mainModule: "worker.js",
// 			modules: {
// 				"worker.js": code,
// 			},
// 			// Block all outbound network access
// 			globalOutbound: null,
// 		});

// 		const result = await worker.getEntrypoint().fetch(request);
// 		return result;
// 	},
// } satisfies ExportedHandler;


export default {
  async fetch(request: Request): Promise<Response> {
    const worker = env.LOADER.load({
      compatibilityDate: "2026-11-13",
      mainModule: "worker.js",
      modules: {
        "worker.js": `
          export default {
            fetch() {
              return new Response("Hello from Dynamic Worker!");
            }
          };
        `,
      },
      globalOutbound: null,
    });

    return worker.getEntrypoint().fetch(request);
  },
} satisfies ExportedHandler<Env>;