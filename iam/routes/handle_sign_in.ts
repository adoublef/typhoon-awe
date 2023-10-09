import { Handler, signIn } from "~/deps.ts";
import { getOAuthClient } from "~/iam/oauth/get_oauth_client.ts";
import { setClientCookie } from "~/iam/oauth/cookie.ts";
import { parseProvider } from "~/iam/oauth/provider.ts";

export function handleSignIn(): Handler {
    return async (c) => {
        const clientName = parseProvider(c.req.query("v"));
        const oauthClient = getOAuthClient(clientName);

        const { headers } = await signIn(c.req.raw, oauthClient);
        setClientCookie(c, clientName);

        c.header("set-cookie", headers.get("set-cookie")!, { append: true });
        return c.redirect(headers.get("location")!);
    };
}
