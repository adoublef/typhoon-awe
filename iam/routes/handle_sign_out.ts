import { Env } from "$hono/types.ts";
import { Handler, signOut } from "~/deps.ts";

export function handleSignOut<
    E extends Env
>(): Handler<E> {
    return ({ redirect, req, header }) => {
        const { headers } = signOut(req.raw);
        // signout use sessions(?)
        header("set-cookie", headers.get("set-cookie")!, { append: true });
        return redirect("/",/* headers.get("location")! */);
    };
}