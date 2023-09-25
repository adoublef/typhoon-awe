import { Handler } from "~/deps.ts";
import { signOut } from "~/iam/deps.ts";
import { IamEnv } from "~/iam/middleware.ts";

export function handleSignOut<
    E extends IamEnv = IamEnv
>(): Handler<E> {
    return async ({ redirect, req, header }) => {
        const { headers } = await signOut(req.raw);
        // signout use sessions(?)
        header("set-cookie", headers.get("set-cookie")!);
        return redirect("/",/* headers.get("location")! */);
    };
}