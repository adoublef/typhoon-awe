import { Handler } from "~/deps.ts";
import { callback } from "~/iam/deps.ts";
import { getProfile } from "~/iam/libsql/get_profile.ts";
import { setProfileBySession } from "~/iam/kv/set_profile_by_session.ts";
import { addUser } from "~/iam/libsql/add_user.ts";
import { DenoKvEnv, LibSqlEnv } from "~/middleware.ts";
import { getOAuthClient } from "~/iam/oauth/get_oauth_client.ts";
import { getOAuthUser } from "~/iam/oauth/get_oauth_user.ts";
import { getClientCookie } from "~/iam/oauth/cookie.ts";

export function handleCallback<
    E extends LibSqlEnv & DenoKvEnv
>(): Handler<E> {
    return async (c) => {
        const clientName = getClientCookie(c);
        const oauthClient = getOAuthClient(clientName);

        const { response: { headers }, accessToken, sessionId } =
            await callback(c.req.raw, oauthClient);

        const [kv, dao] = [c.get("kv"), c.get("db")];
        // FIXME -- anything that could fail, should have an escape hatch
        const oauthUser = await getOAuthUser(clientName, accessToken);
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
