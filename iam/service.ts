import { Hono } from "~/deps.ts";
import { handleCallback } from "~/iam/routes/handle_callback.ts";
import { handleSignIn } from "~/iam/routes/handle_sign_in.ts";
import { handleSignOut } from "~/iam/routes/handle_sign_out.ts";
import { handleIndex } from "~/iam/routes/handle_index.tsx";
import { handleSettings } from "~/iam/routes/handle_settings.tsx";

/**
 * - `GET /`
 * 
 * - `GET /signup`
 * 
 * - `GET /signout`
 * 
 * - `GET /callback`
 * 
 * - `GET /settings`
 */
export const app = new Hono();

app.get("/", handleIndex());
app.get("/signin", handleSignIn());
app.get("/callback", handleCallback());
app.get("/signout", handleSignOut());
app.get("/settings", handleSettings());