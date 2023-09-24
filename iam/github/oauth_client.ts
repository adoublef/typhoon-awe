import { createGitHubOAuthConfig } from "~/iam/deps.ts";

if (
    (await Deno.permissions.request({ name: "env", variable: "HOSTNAME" })).state !== "granted"
) {
    Deno.exit(1);
}

// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#redirect-urls
export const oauthClient = createGitHubOAuthConfig({
    redirectUri: `${Deno.env.get("HOSTNAME")}/i/callback`,
});