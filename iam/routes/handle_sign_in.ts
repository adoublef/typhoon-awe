import { Handler } from "~/deps.ts";
import { signIn } from "~/iam/deps.ts";

export function handleSignIn(): Handler {
    return async ({ redirect, req, get, header }) => {
        const { headers } = await signIn(req.raw, get("iam"));

        header("set-cookie", headers.get("set-cookie")!);
        return redirect(headers.get("location")!);
    };
}