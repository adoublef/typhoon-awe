import { Handler } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";
import { Show } from "~/jsx/control_flow/show.tsx";
import { Profile, ProfileEnv, SessionEnv } from "~/iam/iam.ts";
import { DenoKvEnv } from "~/lib/kv/deno_kv.ts";

export function handleIndex<
    E extends SessionEnv & DenoKvEnv & ProfileEnv
>(): Handler<E> {
    return /* async */ (c) => {
        // NOTE -- annoying the type can't be inferred
        const profile = c.get("profile") as Profile | undefined;

        const head = {
            title: profile ? `Welcome, ${profile.display}` : "Home",
        };

        return c.html(
            <Html head={head}>
                <header>
                    <nav>
                        <ul>
                            <li>
                                <a href="/">Home</a>
                            </li>
                            <li>
                                <Show when={profile} fallback={
                                    <ul>
                                        <li><a hx-boost={false} href="/signin?v=google">Google Signin</a></li>
                                        <li><a hx-boost={false} href="/signin?v=github">GitHub Signin</a></li>
                                        <li><a href="/about">About</a></li>
                                    </ul>
                                }>
                                    {_profile => (
                                        <ul>
                                            <li><a href="/signout">Signout</a></li>
                                            <li><a href="/settings">Settings</a></li>
                                            <li><a href="/about">About</a></li>
                                        </ul>
                                    )}
                                </Show>
                            </li>
                        </ul>
                    </nav>
                </header>
                <main>
                    <hgroup>
                        <Show when={profile} fallback={<h1>Welcome</h1>}>
                            {profile => (<h1>Welcome, {profile.display}</h1>)}
                        </Show>
                        <h2>Still under construction 👷🏿</h2>
                    </hgroup>
                </main>
                <footer>
                    <small hx-boost={false}>
                        Powered by <a href="https://deno.com">Deno</a>.
                        Source code on <a href="https://github.com/adoublef/typhoon-awe">GitHub</a>
                    </small>
                </footer>
            </Html>
        );
    };
}

