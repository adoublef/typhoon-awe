import { Client, MiddlewareHandler, LibsqlError } from "~/deps.ts";

/**
 * Turso will add an instance of db connection to the request context
 */
export function turso<
    E extends { Variables: { db: Client; }; }
>(db: Client): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("db", db);
        await next();
    };
}

/**
 * Ping will ping the database to check that all is good.
 * 
 * Throws error if it failed the request.
 */
export async function ping(c: Client): Promise<true> {
    // this will currently only ping `SELECT 42`
    // TODO -- ping for specific tables in the table
    // TODO -- option to sync with the external database
    try {
        const ok = (await c.execute("SELECT 42")).rows.length !== 0;
        if (!ok) {
            throw new ReferenceError("error pinging the database");
        }
        return ok;
    } catch (error) {
        if (error instanceof LibsqlError) {
            throw new ReferenceError("error pinging the database", { cause: error });
        }
        throw error;
    }
}