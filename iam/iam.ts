import { Output, object, optional, parse, string, transform, ulid } from "~/deps.ts";
import { Ulid } from "~/lib/id/mod.ts";
import { nullish } from "$valibot/src/schemas/index.ts";

const profile = transform(
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

export type Profile = Output<typeof profile>;

export function parseProfile(data: unknown): Profile {
    try {
        return parse(profile, data);
    } catch (_error) {
        throw new TypeError(`invalid input for profile`);
    }
}

const credentials = transform(
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

export type Credentials = Output<typeof credentials>;

export function parseCredentials(data: unknown): Credentials {
    try {
        return parse(credentials, data);
    } catch (_error) {
        throw new TypeError(`invalid input for credentials`);
    }
}