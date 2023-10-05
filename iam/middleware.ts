import { OAuth2ClientConfig, getSessionId } from "~/iam/deps.ts";
import { MiddlewareHandler } from "~/deps.ts";
import { Profile } from "~/iam/iam.ts";
import { getProfileBySession } from "~/iam/kv/get_profile_by_session.ts";

export function oauth<
    E extends {Variables: { iam: OAuth2ClientConfig; }}
>(client: OAuth2ClientConfig): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("iam", client);
        return await next();
    };
};

export function session<
    E extends {Variables:{ sessionId: string | undefined; }},
>(): MiddlewareHandler<E> {
    return async ({ req, set }, next) => {
        set("sessionId", getSessionId(req.raw));
        return await next();
    };
}

// export type ProfileEnv = HttpEnv<{ profile: Profile | undefined; }>;

// export function profile<
//     E extends ProfileEnv & DenoKvEnv = ProfileEnv & DenoKvEnv
// >(args?: { redirectUrl?: string; }): MiddlewareHandler<E> {
//     return async (c, next) => {
//         const sessionId = getSessionId(c.req.raw);

//         const profile = sessionId
//             ? await getProfileBySession(c.get("kv"), sessionId)
//             : undefined;

//         if (!profile && args?.redirectUrl) {
//             return c.redirect(args.redirectUrl);
//         }

//         // TODO -- How can I have this value always exist?
//         c.set("profile", profile);
//         return await next();
//     };
// }