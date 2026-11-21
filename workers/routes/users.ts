// import { Hono } from "hono";
// import { createAuth } from "~/lib/auth.server";

// const users = new Hono<{ Bindings: Env }>()
//     .get("/", async (c) => {
   
//         const auth = createAuth(c.env);
//         const users = await auth.api.listUsers({
//             query: {
//                 limit: 100,
//                 sortBy: "createdAt",
//                 sortDirection: "desc",
//             },
//             headers: c.req.header(),
//         });

//         return c.json( users );
//     });

// export default users;