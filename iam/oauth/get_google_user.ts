import { transform, object, string, Output, parse } from "~/deps.ts";

const api = "https://www.googleapis.com/oauth2/v1/userinfo";

const googleUser = transform(
    object({
        id: string(),
        email: string(),
        picture: string(),
        name: string(),
    }),
    ({
        picture, email, id,
        ...data
    }) => ({
        ...data,
        avatar: picture,
        login: email.split("@").shift()!,
        id: `google|${id}`
    }),
);

type GoogleUser = Output<typeof googleUser>;

export function parseGoogleUser(data: unknown): GoogleUser {
    try {
        return parse(googleUser, data);
    } catch (_error) {
        throw new TypeError(`failed to parse google user profile`);
    }
}

export async function getGoogleUser(accessToken: string): Promise<GoogleUser> {
    const res = await fetch(api, { method: "get", headers: { "authorization": `Bearer ${accessToken}` } });
    // FIXME -- if errors throw check the shape of google
    return parseGoogleUser(await res.json());
}