import { getPlatformProxy } from "wrangler";
import { createAuth } from "~/lib/auth.server";

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
} finally {
    await platform.dispose();
}

process.exit(0);