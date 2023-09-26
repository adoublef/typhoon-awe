// FIXME -- add testing
import { Context, Cookie, CookieOptions, getCookie, setCookie } from "~/deps.ts";
import { Provider, parseProvider } from "~/iam/oauth/provider.ts";

const OAUTH_COOKIE_NAME = "oauth-provider";

function isSecure(requestUrl: string) {
    return new URL(requestUrl).protocol === "https:";
}

function getCookieName(name: string, isSecure: boolean) {
    return isSecure ? "__Host-" + name : name;
}

const COOKIE_BASE = {
    path: "/",
    httpOnly: true,
    // 90 days
    maxAge: 7776000,
    sameSite: "Lax",
} as Required<Pick<Cookie, "path" | "httpOnly" | "maxAge" | "sameSite">>;


export function getClientCookie(c: Context): Provider {
    const cookieName = getCookieName(OAUTH_COOKIE_NAME, isSecure(c.req.url));
    // use a parser to verify this
    return parseProvider(getCookie(c, cookieName));
}

export function setClientCookie(c: Context, value: Provider) {
    const cookieName = getCookieName(OAUTH_COOKIE_NAME, isSecure(c.req.url));
    const opts: CookieOptions = {
        ...COOKIE_BASE,
        secure: isSecure(c.req.url),
        maxAge: 10 * 60,
    };
    setCookie(c, cookieName, value, opts);
}