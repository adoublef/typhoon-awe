import { Handler } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";
import { SessionEnv } from "~/iam/middleware.ts";
import { DenoKvEnv } from "~/middleware.ts";
import { getProfileBySession } from "~/iam/kv/get_profile_by_session.ts";

export function handleIndex<
    E extends SessionEnv & DenoKvEnv = SessionEnv & DenoKvEnv
>(): Handler<E> {
    return async ({ html, req, get }) => {
        const sessionId = get("sessionId");

        const profile = sessionId
            ? await getProfileBySession(get("kv"), sessionId)
            : undefined;

        const head = {
            title: "Hello, World",
            baseUrl: new URL(req.url).origin
        };

        return html(
            <Html head={head}>
                <header>
                    <nav>
                        <a href="/">home</a>
                        <nav>
                            <ul hx-boost={false}>
                                <li><a href="/signin">signin</a></li>
                                <li><a href="/signout">signout</a></li>
                                <li><a href="/settings">settings</a></li>
                            </ul>
                        </nav>
                    </nav>
                </header>
                <main>
                    <code>
                        {profile && JSON.stringify(profile, null, 2)}
                    </code>
                </main>
            </Html>
        );
    };
}