import { Handler } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";
import { ProfileEnv, SessionEnv } from "~/iam/middleware.ts";
import { DenoKvEnv } from "~/middleware.ts";
import { Show } from "~/jsx/control_flow/show.tsx";
import { Profile } from "~/iam/iam.ts";

export function handleIndex<
    E extends SessionEnv & DenoKvEnv & ProfileEnv
>(): Handler<E> {
    return /* async */ ({ html, req, get }) => {
        // NOTE -- annoying the type can't be inferred
        const profile = get("profile") as Profile | undefined

        const head = {
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

