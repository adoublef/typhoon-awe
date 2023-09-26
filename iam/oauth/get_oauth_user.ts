import { number } from "$valibot/src/schemas/index.ts";
import { transform, object, string, Output, parse } from "~/deps.ts";
import { Provider } from "~/iam/oauth/provider.ts";

export function getOAuthUser(clientName: Provider, accessToken: string) {
    switch (clientName) {
        case "github": return getGithubUser(accessToken);
        case "google": return getGoogleUser(accessToken);
    }
}

const githubUrl = "https://api.github.com/user";

const githubUser = transform(
    object({
        id: number(),
        login: string(),
        avatar_url: string(),
        name: string(),
    }),
    ({
        avatar_url, id,
        ...data
    }) => ({
        ...data,
        avatar: avatar_url,
        id: `github|${id}`
    }),
);

type GithubUser = Output<typeof githubUser>;

export function parseGithubUser(data: unknown): GithubUser {
    try {
        return parse(githubUser, data);
    } catch (_error) {
        throw new TypeError(`failed to parse github user profile`);
    }
}

export async function getGithubUser(accessToken: string): Promise<GithubUser> {
    const res = await fetch(githubUrl, { method: "get", headers: { "authorization": `Bearer ${accessToken}` } });
    // FIXME -- if errors throw
    return parseGithubUser(await res.json());
}

const googleUrl = "https://www.googleapis.com/oauth2/v1/userinfo";

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
    const res = await fetch(googleUrl, { method: "get", headers: { "authorization": `Bearer ${accessToken}` } });
    // FIXME -- if errors throw check the shape of google
    return parseGoogleUser(await res.json());
}