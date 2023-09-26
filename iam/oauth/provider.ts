import { custom, parse, string } from "~/deps.ts";

export type Provider = "github" | "google";

export function parseProvider(data?: string): Provider {
    // default as `google`
    try {
        return parse(string([custom(isProvider)]), data) as Provider;
    } catch (_error) {
        return "google";
    }
}

function isProvider(name: string): name is Provider {
    return ["github", "google"].includes(name);
}