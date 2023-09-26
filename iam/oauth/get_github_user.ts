import { number } from "$valibot/src/schemas/index.ts";
import { transform, object, string, Output, parse } from "~/deps.ts";

const api = "https://api.github.com/user";

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
    const res = await fetch(api, { method: "get", headers: { "authorization": `Bearer ${accessToken}` } });
    // FIXME -- if errors throw
    return parseGithubUser(await res.json());
}