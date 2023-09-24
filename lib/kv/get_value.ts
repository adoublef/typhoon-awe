export async function getValue<T>(kv: Deno.Kv, key: Deno.KvKey, options?: { consistency?: Deno.KvConsistencyLevel; }): Promise<T | undefined> {
    return (await kv.get<T>(key, options)).value ?? undefined;
}