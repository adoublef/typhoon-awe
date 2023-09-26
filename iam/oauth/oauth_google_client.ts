/**
 * [Reference](https://support.google.com/cloud/answer/6158849?hl=en)
 */
import { createGoogleOAuthConfig } from "~/iam/deps.ts";
import { getRequiredEnv } from "~/lib/env.ts";

// https://support.google.com/cloud/answer/6158849?hl=en#zippy=%2Cuser-consent%2Cauthorized-domains%2Cpublic-and-internal-applications
// https://stackoverflow.com/a/67913727/4239443
export const oauthClient = createGoogleOAuthConfig({
    redirectUri: `${getRequiredEnv("HOSTNAME")}/callback`,
    scope: getRequiredEnv("GOOGLE_OAUTH_SCOPE").split(",")
});