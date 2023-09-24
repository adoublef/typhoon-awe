import { Client, createClient } from "~/lib/libsql/mod.ts";
import dax from "$dax";

export function withClient(
    fn: (c: Client) => Promise<void>,
    // { src }: { src: string; }
): (t: Deno.TestContext) => Promise<void> {
    return async (_t: Deno.TestContext) => {
        const filename = `iam-${crypto.randomUUID()}.db`;

        const f = await Deno.create(`./${filename}`);
        const c = createClient({ url: `file:${filename}` });
        try {
            const rs = await dax`atlas schema apply --url sqlite://${filename} --to file://iam/libsql/schema.sql --dev-url sqlite://file?mode=memory --auto-approve`.quiet();
            // still shows error if there is one
            if (rs.code !== 0) {
                throw new Error(`failed to load script ${rs.stderr}`);
            }

            await fn(c);
        } finally {
            c.close(); f.close();
            await Deno.remove(`./${filename}`);
        }
    };
}
