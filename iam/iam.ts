import {
    MiddlewareHandler
    , Output
    , object
    , optional
    , parse
    , string
    , transform
    , ulid
    , OAuth2ClientConfig
    , getSessionId
} from "~/deps.ts";
import { Ulid } from "~/lib/id/mod.ts";
import { nullish } from "$valibot/src/schemas/index.ts";
import { DenoKvEnv } from "~/lib/kv/deno_kv.ts";
import { getProfileBySession } from "~/iam/kv/get_profile_by_session.ts";

const profileSchema = transform(
    object({
        id: optional(string([ulid()])),
        display: string(),
        name: nullish(string()),
        image: nullish(string()),
    }),
    ({
        id,
        ...data
    }) => ({
        ...data,
        id: new Ulid(id)
    })
);

export type Profile = Output<typeof profileSchema>;

export function parseProfile(data: unknown): Profile {
    try {
        return parse(profileSchema, data);
    } catch (_error) {
        throw new TypeError(`invalid input for profile`);
    }
}

export type ProfileEnv = {
    Variables: {
        profile: Profile | undefined;
    };
};

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

const credentialsSchema = transform(
    object({
        profile: string([ulid()]),
        // must have a `${"github"|"google"}|${"id"}`
        login: string(),
    }),
    ({
        profile,
        ...data
    }) => ({
        ...data,
        profile: new Ulid(profile)
    })
);

export type Credentials = Output<typeof credentialsSchema>;

export function parseCredentials(data: unknown): Credentials {
    try {
        return parse(credentialsSchema, data);
    } catch (_error) {
        throw new TypeError(`invalid input for credentials`);
    }
}

export type OAuthEnv = {
    Variables: {
        iam: OAuth2ClientConfig;
    };
};

export function oauth<
    E extends OAuthEnv
>(client: OAuth2ClientConfig): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("iam", client);
        return await next();
    };
};

export type SessionEnv = {
    Variables: {
        sessionId: string | undefined;
    };
};

export function session<
    E extends SessionEnv
>(): MiddlewareHandler<E> {
    return async ({ req, set }, next) => {
        set("sessionId", getSessionId(req.raw));
        return await next();
    };
}