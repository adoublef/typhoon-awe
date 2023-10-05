import {
    HTTPException
    , Handler
    , Output
    , Status
    , maxBytes
    , object
    , optional
    , parse
    , string
} from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";

export function handleError(): Handler {
    return (c) => {
        return c.html(
            <Html head={{ title: "Oh, no!" }}>
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
                        <h1>
                            Oh, no!
                        </h1>
                        <h2>Looks like we found an error</h2>
                    </hgroup>
                </main>
                <footer>
                    <small hx-boost={false}>
                        Powered by <a href="https://deno.com">Deno</a>.
                        Source code on <a href="https://github.com/adoublef/ringed-crow">GitHub</a>
                    </small>
                </footer>
            </Html >
        );
    };
}
