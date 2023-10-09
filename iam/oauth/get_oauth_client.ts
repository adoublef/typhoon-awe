import { OAuth2ClientConfig, createGitHubOAuthConfig, createGoogleOAuthConfig } from "~/deps.ts";
import { env } from "~/lib/env.ts";
import { Provider } from "~/iam/oauth/provider.ts";

export function getOAuthClient(name: Provider): OAuth2ClientConfig {
    switch (name) {
        case "github": return github;
        case "google": return google;
    }
}

// https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#redirect-urls
export const github = createGitHubOAuthConfig({
    redirectUri: `${env("HOSTNAME")}/callback`,
});

// https://support.google.com/cloud/answer/6158849?hl=en#zippy=%2Cuser-consent%2Cauthorized-domains%2Cpublic-and-internal-applications
// https://stackoverflow.com/a/67913727/4239443
export const google = createGoogleOAuthConfig({
    redirectUri: `${env("HOSTNAME")}/callback`,
    scope: env("GOOGLE_OAUTH_SCOPE").split(",")
});