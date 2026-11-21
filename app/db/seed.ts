import { getPlatformProxy } from "wrangler";
import { createAuth } from "~/lib/auth.server";
import { createDb } from ".";
import { attributes, attributeValues, layouts, pages,  routes, systemSettings } from "./schema";

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

    const [layoutRecord] = await db.insert(layouts).values({
        name: "標準レイアウト",
        description: "標準のレイアウト",
        body: `
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title><%= title %></title>
      </head>
      <body>
        <main>
          <%- page.field.content %>
        </main>
      </body>
    </html>
  `,
        contentType: "text/html",
    }).returning({ id: layouts.id });

    const [pageRecord] = await db.insert(pages).values({
        title: "サンプルページ",
        data: "",
        layoutId: layoutRecord.id
    }).returning({ id: pages.id });

    const [attributeRecord] = await db.insert(attributes).values({
        label: "ページ内容",
        name: "content",
        position: 0,
        description: "ページの内容",
        // setting: {
        //     title: "概要",
        //     description: "ページの説明を入力してください",
        // },
        valueType: "text",
        layoutId: layoutRecord.id
    }).returning({ id: attributes.id });

    await db.insert(attributeValues).values({
        id: crypto.randomUUID(),
        attributeId: attributeRecord.id,
        pageId: pageRecord.id,
        valueText: "<h1>サンプルページ</h1><p>これはテストページです。</p>",
    }).returning({ id: attributeValues.id });

    // await db.insert(indexNodes).values({
    //     id: ROOT_ROUTE_ID,

    // })

    const [routeRecord] = await db.insert(routes).values({
        // id: ROOT_ROUTE_ID,
        parentId: null,
        slug: "/",
        pageId: pageRecord.id
    }).returning({ id: routes.id });

    console.log("Success");

} catch (e) {
    console.log(e)
} finally {
    await platform.dispose();
}

process.exit(0);