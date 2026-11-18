import { getPlatformProxy } from "wrangler";
import { createAuth } from "~/lib/auth.server";
import { createDb } from ".";
import { indexNodes, ROOT_ID, systemSettings } from "./schema";

const platform = await getPlatformProxy<Env>({
    configPath: "./wrangler.jsonc",
    persist: true,
});
try {

    const auth = createAuth(platform.env);

    const result = await auth.api.createUser({
        body: {
            name: "Admin",
            email: "admin@example.com",
            password: "passwordpassword123"!,
            role: "admin",
        },
    });

    console.log(result);
    console.log("Admin created:", result.user.email);

    const db = createDb(platform.env.pages);
    await db.insert(systemSettings).values({
        name: "mime-types",
        value: [
            { label: "HTML", value: "text/html" },
            { label: "CSS", value: "text/css" },
            { label: "テキスト", value: "text/plain" },
            { label: "JavaScript", value: "application/javascript" },
            { label: "JSON", value: "application/json" },
            { label: "XML", value: "application/xml" },
            { label: "SVG画像", value: "image/svg+xml" },
            { label: "PNG画像", value: "image/png" },
            { label: "JPEG画像", value: "image/jpeg" },
            { label: "WebP画像", value: "image/webp" },
            { label: "PDF", value: "application/pdf" },
            { label: "バイナリデータ", value: "application/octet-stream" },
        ],
    })

    // await db.insert(indexNodes).values({
    //     id: ROOT_ID,

    // })


} catch (e) {
    console.log(e)
} finally {
    await platform.dispose();
}

process.exit(0);