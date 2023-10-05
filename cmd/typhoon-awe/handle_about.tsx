import { Handler } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";

export function handleAbout(): Handler {
    return c => {
        return c.html(
            <Html head={{ title: "About" }}>
                <header>
                    <nav>
                        <ul>
                            <li>
                                <a href="/">Home</a>
                            </li>
                            <li>
                                <a href="/about">About</a>
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