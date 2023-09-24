import { Ulid } from "~/lib/id/ulid.ts";
import { Client } from "~/deps.ts";
import { Credentials, Profile } from "~/iam/iam.ts";
import { Optional } from "~/lib/@types/mod.ts";

type User = Optional<Omit<Profile & Credentials, "profile">, "id">;

const sqlp = `
INSERT INTO \`profiles\` (id, display, name, image)
VALUES (?, ?, ?, ?)`;

const sqlc = `
INSERT INTO \`credentials\` (profile, login)
VALUES (?, ?)`;

export async function addUser(c: Client, { id = new Ulid(), display, name, image, login }: User): Promise<Ulid> {
    const tx = await c.transaction("write");
    try {
        await tx.execute({ args: [id.toString(), display, name ?? null, image ?? null], sql: sqlp },);
        await tx.execute({ args: [id.toString(), login], sql: sqlc });

        await tx.commit();
    } catch (error) {
        throw new Error(`failed to add user: ${error.message}`);
    } finally {
        !tx.closed && tx.close();
    }

    return id;
}