import { Handler } from "~/deps.ts";
import { DenoKvEnv } from "~/middleware.ts";
import { SessionEnv } from "~/iam/middleware.ts";
import { getProfileBySession } from "~/iam/kv/get_profile_by_session.ts";
import { Html } from "~/jsx/dom/html.tsx";

export function handleSettings<
    E extends SessionEnv & DenoKvEnv = SessionEnv & DenoKvEnv
>(): Handler<E> {
    return async ({ html, req, get, redirect }) => {
        const sessionId = get("sessionId");

        const profile = sessionId
            ? await getProfileBySession(get("kv"), sessionId)
            : undefined;

        // if no profile then redirect to signin
        if (!profile) {
            return redirect("/signin");
        }

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
                        <p>under review</p>
                    </header>
                </main>
            </Html>
        );
    };
}