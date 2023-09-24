import { Client } from "~/deps.ts";
import { Profile, parseProfile } from "~/iam/iam.ts";

const sql = `
SELECT p.id, p.display, p.name, p.image
FROM \`profiles\` AS p
WHERE p.id IN 
    (SELECT c.profile FROM \`credentials\` AS c WHERE c.login = ?)
LIMIT 1`;

export async function getProfile(c: Client, login: string): Promise<Profile | undefined> {
    try {
        const row = (await c.execute({ args: [login], sql })).rows.at(0);
        if (!row) {
            return undefined;
        }

        return parseProfile(row);
    } catch (error) {
        throw new Error(`failed to get profile: ${error.message}`);
    }
}