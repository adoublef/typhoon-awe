import { Hono, logger } from "~/deps.ts";

if (import.meta.main) {
    const app = new Hono();
    app.use("*", logger());
    {
        app.get("/", ({ text }) => text("Hello, World!"));
    }

    await Deno.serve(app.fetch).finished;
}