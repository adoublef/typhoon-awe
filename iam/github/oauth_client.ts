import { createGitHubOAuthConfig } from "~/iam/deps.ts";
import { getRequiredEnv } from "~/lib/env.ts";

// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#redirect-urls
export const oauthClient = createGitHubOAuthConfig({
    redirectUri: `${getRequiredEnv("HOSTNAME")}/callback`,
});