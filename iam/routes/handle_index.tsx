import { Handler } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";
import { SessionEnv } from "~/iam/middleware.ts";
import { DenoKvEnv } from "~/middleware.ts";
import { getProfileBySession } from "~/iam/kv/get_profile_by_session.ts";
import { Show } from "~/jsx/control_flow/show.tsx";

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
                            <Show when={profile} fallback={
                                <ul hx-boost={false}>
                                    <li><a href="/signin">signin</a></li>
                                </ul>
                            }>
                                {profile => (
                                    <ul hx-boost={false}>
                                        <li><a href="/signout">signout</a></li>
                                    </ul>
                                )}
                            </Show>
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

