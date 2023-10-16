import { Handler, Show } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";
import { ProfileEnv, Profile } from "~/iam/iam.ts";

export function handleAbout<
    E extends ProfileEnv
>(): Handler<E> {
    return c => {
        const profile = c.get("profile") as Profile | undefined;

        return c.html(
            <Html head={{ title: "About" }}>
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
                        <h1>About</h1>
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