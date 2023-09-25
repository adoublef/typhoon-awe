import { Handler } from "~/deps.ts";
import { ProfileEnv } from "~/iam/middleware.ts";
import { Html } from "~/jsx/dom/html.tsx";

export function handleSettings<
    E extends ProfileEnv
>(): Handler<E> {
    return ({ html, req }) => {
        const head = {
            title: "Settings",
            baseUrl: new URL(req.url).origin
        };

        return html(
            <Html head={head}>
                <header>
                    <nav>
                        <a href="/">home</a>
                        <nav>
                            <ul hx-boost={false}>
                                <li><a href="/signout">signout</a></li>
                                <li><a href="/settings">settings</a></li>
                            </ul>
                        </nav>
                    </nav>
                </header>
                <main>
                    <header>
                        <h1>settings</h1>
                    </header>
                </main>
            </Html>
        );
    };
}