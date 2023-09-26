import { Client, Hono, logger, serveStatic } from "~/deps.ts";
import { app as iam } from "~/iam/service.ts";
import { createClient } from "$libsql-client-ts/web.js";
import { getRequiredEnv } from "~/lib/env.ts";
import { session } from "~/iam/middleware.ts";
import { denoKv, turso } from "~/middleware.ts";

const sql = `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`;

async function ping(c: Client, tableName: string): Promise<boolean> {
    return (await c.execute({ sql, args: [tableName] })).rows.length !== 0;
}

if (import.meta.main) {
    const [url, authToken] = ["DATABASE_URL", "TURSO_TOKEN"].map(getRequiredEnv);
    const db = createClient({ url, authToken });
    if (
        !(await ping(db, "profiles"))
    ) {
        throw new Error("failed to connect to the database");
    }

    const kv = await Deno.openKv();

    const app = new Hono();
    app.use("*", logger(), session(), denoKv(kv), turso(db));
    {
        app.route("/", iam);
    }
    app.get("/static/*", serveStatic({ root: "./" }));

    await Deno.serve(app.fetch).finished;
}