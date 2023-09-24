import { Handler } from "~/deps.ts";
import { signOut } from "~/iam/deps.ts";

export function handleSignOut(): Handler {
    return async ({ redirect, req, header }) => {
        const { headers } = await signOut(req.raw);
        header("set-cookie", headers.get("set-cookie")!);
        return redirect(headers.get("location")!);
    };
}