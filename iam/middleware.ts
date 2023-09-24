import { OAuth2Client, OAuth2ClientConfig, getSessionId } from "~/iam/deps.ts";
import { MiddlewareHandler } from "~/deps.ts";
import { HttpEnv } from "~/middleware.ts";

export type IamEnv = HttpEnv<{ iam: OAuth2ClientConfig; }>;

export function oauth<
    E extends IamEnv = IamEnv
>(client: OAuth2ClientConfig): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("iam", client);
        await next();
    };
};

export type SessionEnv = HttpEnv<{ sessionId: string | undefined; }>;

export function session<
    Env extends SessionEnv = SessionEnv,
>(): MiddlewareHandler<Env> {
    return async ({ req, set }, next) => {
        set("sessionId", getSessionId(req.raw));
        return await next();
    };
}
