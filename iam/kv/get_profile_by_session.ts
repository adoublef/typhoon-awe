import { Profile, parseProfile } from "~/iam/iam.ts";
import { getValue } from "~/lib/kv/get_value.ts";

export async function getProfileBySession(kv: Deno.Kv, sessionId: string): Promise<Profile | undefined> {
    const key = ["profiles_by_session", sessionId];
    const res = (
        await getValue(kv, key, { consistency: "eventual" }) ?? await getValue(kv, key)
    );
    if (!res) {
        return undefined;
    }

    return parseProfile(res);
}