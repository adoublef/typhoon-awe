import { Hono, logger, serveStatic } from "~/deps.ts";
import { handleIndex } from "../../iam/routes/handle_index.tsx";

if (import.meta.main) {
    const app = new Hono();
    app.use("*", logger());
    {
        app.get("/", handleIndex());
    }
    app.get("/static/*", serveStatic({ root: "./" }));

    await Deno.serve(app.fetch).finished;
}