import { Client, Hono, logger, serveStatic } from "~/deps.ts";
import { app as iam } from "~/iam/service.ts";
import { oauth, session } from "~/iam/middleware.ts";
import { denoKv, turso } from "~/middleware.ts";
import { createClient } from "~/lib/libsql/deno.ts";
import { getRequiredEnv } from "~/lib/env.ts";
import { oauthClient as github } from "~/iam/github/oauth_client.ts";

const sql = `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`;

async function ping(c: Client, tableName: string): Promise<boolean> {
    return (await c.execute({ sql, args: [tableName] })).rows.length !== 0;
}

if (import.meta.main) {
    const db = createClient({ url: getRequiredEnv("DATABASE_URL") });
    if (
        !(await ping(db, "profiles"))
    ) {
        throw new Error("failed to connect to the database");
    }

    const kv = await Deno.openKv();

    const app = new Hono();
    app.use("*", logger(), session(), denoKv(kv), turso(db), oauth(github));
    {
        app.route("/", iam);
    }
    app.get("/static/*", serveStatic({ root: "./" }));

    await Deno.serve(app.fetch).finished;
}