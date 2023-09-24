import { Handler } from "~/deps.ts";
import { signIn } from "~/iam/deps.ts";
import { IamEnv } from "~/iam/middleware.ts";

export function handleSignIn<
    E extends IamEnv = IamEnv
>(): Handler<E> {
    return async ({ redirect, req, get, header }) => {
        const { headers } = await signIn(req.raw, get("iam"));

        header("set-cookie", headers.get("set-cookie")!);
        return redirect(headers.get("location")!);
    };
}