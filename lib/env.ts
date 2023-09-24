export function getRequiredEnv(key: string) {
    const value = Deno.env.get(key);
    if (value === undefined) {
        throw new Error(`"${key}" environment variable must be set`);
    }
    return value;
}