import { OAuth2ClientConfig, getSessionId } from "~/iam/deps.ts";
import { MiddlewareHandler } from "~/deps.ts";
import { DenoKvEnv, HttpEnv } from "~/middleware.ts";
import { Profile } from "~/iam/iam.ts";
import { getProfileBySession } from "~/iam/kv/get_profile_by_session.ts";

export type IamEnv = HttpEnv<{ iam: OAuth2ClientConfig; }>;

export function oauth<
    E extends IamEnv = IamEnv
>(client: OAuth2ClientConfig): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("iam", client);
        return await next();
    };
};

export type SessionEnv = HttpEnv<{ sessionId: string | undefined; }>;

export function session<
    E extends SessionEnv = SessionEnv,
>(): MiddlewareHandler<E> {
    return async ({ req, set }, next) => {
        set("sessionId", getSessionId(req.raw));
        return await next();
    };
}

export type ProfileEnv = HttpEnv<{ profile: Profile | undefined; }>;

export function profile<
    E extends ProfileEnv & DenoKvEnv = ProfileEnv & DenoKvEnv
>(args?: { redirectUrl?: string; }): MiddlewareHandler<E> {
    return async (c, next) => {
        const sessionId = getSessionId(c.req.raw);

        const profile = sessionId
            ? await getProfileBySession(c.get("kv"), sessionId)
            : undefined;

        if (!profile && args?.redirectUrl) {
            return c.redirect(args.redirectUrl);
        }

        // TODO -- How can I have this value always exist?
        c.set("profile", profile);
        return await next();
    };
}