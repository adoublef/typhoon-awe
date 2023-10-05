import { MiddlewareHandler } from "~/deps.ts";

export type DenoKvEnv = {
    Variables: {
        kv: Deno.Kv;
    };
}

export function denoKv<
E extends {Variables:{ kv: Deno.Kv; }}
>(kv: Deno.Kv): MiddlewareHandler<E> {
    return async (c, next) => {
        c.set("kv", kv);
        await next();
    };
}