import { Env } from "$hono/types.ts";
import { Handler } from "~/deps.ts";
import { signOut } from "~/iam/deps.ts";

export function handleSignOut<
    E extends Env
>(): Handler<E> {
    return async ({ redirect, req, header }) => {
        const { headers } = await signOut(req.raw);
        // signout use sessions(?)
        header("set-cookie", headers.get("set-cookie")!, { append: true });
        return redirect("/",/* headers.get("location")! */);
    };
}