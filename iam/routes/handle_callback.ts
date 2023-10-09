import { Handler, callback } from "~/deps.ts";
import { getProfile } from "~/iam/libsql/get_profile.ts";
import { setProfileBySession } from "~/iam/kv/set_profile_by_session.ts";
import { addUser } from "~/iam/libsql/add_user.ts";
import { getOAuthClient } from "~/iam/oauth/get_oauth_client.ts";
import { getOAuthUser } from "~/iam/oauth/get_oauth_user.ts";
import { getClientCookie } from "~/iam/oauth/cookie.ts";
import { TursoEnv } from "~/lib/turso.ts";
import { DenoKvEnv } from "~/lib/kv/deno_kv.ts";

export function handleCallback<
    E extends TursoEnv & DenoKvEnv
>(): Handler<E> {
    return async (c) => {
        const clientName = getClientCookie(c);
        const oauthClient = getOAuthClient(clientName);

        const { response: { headers }, tokens, sessionId } =
            await callback(c.req.raw, oauthClient);

        const [kv, dao] = [c.get("kv"), c.get("db")];
        // FIXME -- anything that could fail, should have an escape hatch
        const oauthUser = await getOAuthUser(clientName, tokens.accessToken);
        const profile = await getProfile(dao, oauthUser.id);
        if (!profile) {
            const profile = { display: oauthUser.login, name: oauthUser.name, image: oauthUser.avatar };
            const id = await addUser(dao, { ...profile, login: oauthUser.id });
            await setProfileBySession(kv, sessionId, { ...profile, id });
        } else {
            await setProfileBySession(kv, sessionId, profile);
        }

        c.header("set-cookie", headers.get("set-cookie")!, { append: true });
        return c.redirect(headers.get("location")!);
    };
}
