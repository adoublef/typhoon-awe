import { Hono } from "~/deps.ts";
import { handleCallback } from "~/iam/routes/handle_callback.ts";
import { handleSignIn } from "~/iam/routes/handle_sign_in.ts";
import { handleSignOut } from "~/iam/routes/handle_sign_out.ts";

export const app = new Hono();

app.get("/signin", handleSignIn());
app.get("/callback", handleCallback());
app.get("/signout", handleSignOut());