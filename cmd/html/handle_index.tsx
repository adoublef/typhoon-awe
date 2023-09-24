import { Handler } from "~/deps.ts";
import { Html } from "~/jsx/dom/html.tsx";

export function handleIndex(): Handler {
    return ({ html, req }) => {
        const head = {
            title: "Hello, World",
            baseUrl: new URL(req.url).origin
        };

        return html(
            <Html head={head}>
                <header>
                    <nav>
                        <a href="/">home</a>
                    </nav>
                </header>
            </Html>
        );
    };
}