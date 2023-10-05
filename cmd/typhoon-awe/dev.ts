import { env } from "~/lib/env.ts";
import { Hono, logger } from "~/deps.ts";
// import { app as iam } from "~/iam/service.ts";
import { session } from "~/iam/middleware.ts";
import { createClient } from "~/lib/libsql/deno.ts";
import { denoKv } from "~/lib/kv/deno_kv.ts";
import { ping, turso } from "~/lib/turso.ts";
import { serve } from "~/lib/serve.ts";
import { handleAbout } from "./handle_about.tsx";
import { handleIndex } from "./handle_index.tsx";
import { handleError } from "./handle_error.tsx";

if (import.meta.main) {
    const db = createClient({ url: env("DATABASE_URL") });
    await ping(db);

    const kv = await Deno.openKv();

    const app = new Hono()
        .use("*", logger(), session(), denoKv(kv), turso(db))
        .onError((_, c) => c.redirect("/ouch"));
    {
        app.get("/", handleIndex());
        app.get("/about", handleAbout());
        app.get("/ouch", handleError());
    }

    await serve(app);
}