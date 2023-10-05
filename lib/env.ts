function unquote(value: string) {
    return value.replace(/^['"]|['"]$/g, "");
}

/**
 * Env is a helper to get environment variable 
 */
export function env(key: string): string {
    const value = Deno.env.get(key)
    if (value === undefined) {
        throw new ReferenceError(`"${key}" environment variable must be set`);
    }
    return unquote(value);
}