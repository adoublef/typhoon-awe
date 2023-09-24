import { Handler } from "~/deps.ts";
import { callback } from "~/iam/deps.ts";
import { getGithubUser } from "~/iam/github/get_github_user.ts";
import { getProfile } from "~/iam/libsql/get_profile.ts";
import { setProfileBySession } from "~/iam/kv/set_profile_by_session.ts";
import { addUser } from "~/iam/libsql/add_user.ts";
import { IamEnv } from "~/iam/middleware.ts";
import { DenoKvEnv, LibSqlEnv } from "~/middleware.ts";

export function handleCallback<
    E extends IamEnv & LibSqlEnv & DenoKvEnv = IamEnv & LibSqlEnv & DenoKvEnv
>(): Handler<E> {
    return async ({ redirect, req, header, get }) => {
        const [kv, dao] = [get("kv"), get("db")];
        const { response: { headers }, accessToken, sessionId } =
            await callback(req.raw, get("iam"));

        const githubUser = await getGithubUser(accessToken);

        const profile = await getProfile(dao, `github|${githubUser.id}`);
        if (!profile) {
            const profile = { display: githubUser.login, name: githubUser.name, image: githubUser.avatarUrl };
            const id = await addUser(dao, { ...profile, login: `github|${githubUser.id}` });
            await setProfileBySession(kv, sessionId, { ...profile, id });
        } else {
            await setProfileBySession(kv, sessionId, profile);
        }

        header("set-cookie", headers.get("set-cookie")!);
        return redirect(headers.get("location")!);
    };
}