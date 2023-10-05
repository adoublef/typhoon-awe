import { Handler } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";
import { ProfileEnv } from "~/iam/iam.ts";

export function handleSettings<
    E extends ProfileEnv
>(): Handler<E> {
    return (c) => {
        return c.html(
            <Html head={{ title: "Settings" }}>
                <header>
                    <nav>
                        <ul>
                            <li>
                                <a href="/">Home</a>
                            </li>
                            <li>
                                <ul>
                                    <li><a href="/signout">Signout</a></li>
                                    <li><a href="/settings">Settings</a></li>
                                </ul>
                            </li>
                        </ul>
                        <nav>
                        </nav>
                    </nav>
                </header>
                <main>
                    <hgroup>
                        <h1>Settings</h1>
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