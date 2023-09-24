import { Profile } from "~/iam/iam.ts";

export async function getProfile(kv: Deno.Kv, sessionId: string, { id, ...profile }: Profile): Promise<void> {
    const key = ["profiles_by_session", sessionId];

    const res = await kv.atomic()
        .check({ key, versionstamp: null })
        .set(key, { ...profile, id: id.toJSON() })
        .commit();

    if (!res.ok) {
        throw new Error(`failed to set profile for session: ${sessionId}`);
    }
}
