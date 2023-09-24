import { Client, MiddlewareHandler } from "~/deps.ts";

export type HttpEnv<T extends Record<string, unknown> = {}> = {
    Variables: T;
};

export type DenoKvEnv = HttpEnv<{ kv: Deno.Kv; }>;

export function denoKv<
    E extends DenoKvEnv = DenoKvEnv
>(kv: Deno.Kv): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("kv", kv);
        await next();
    };
}

export type LibSqlEnv = HttpEnv<{ db: Client; }>;

export function turso<
    E extends LibSqlEnv = LibSqlEnv
>(db: Client): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("db", db);
        await next();
    };
}