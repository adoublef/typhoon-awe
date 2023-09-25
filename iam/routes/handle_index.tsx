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
            // Change depending on if profile exists
            title: profile ? `Welcome, ${profile.display}` : "Home",
            baseUrl: new URL(req.url).origin
        };

        return html(
            <Html head={head}>
                <header>
                    <nav>
                        <a href="/">home</a>
                        <nav>
                            <ul hx-boost={false}>
                                <Show when={profile} fallback={
                                    <li><a href="/signin">signin</a></li>
                                }>
                                    {profile => (
                                        <>
                                            <li><a href="/signout">signout</a></li>
                                            <li><a href="/settings">settings</a></li>
                                        </>
                                    )}

                                </Show>
                            </ul>
                        </nav>
                    </nav>
                </header>
                <main>
                    <header>
                        <Show when={profile}>
                            {profile => (<h1>welcome, {profile.display}</h1>)}
                        </Show>
                    </header>
                </main>
            </Html>
        );
    };
}

