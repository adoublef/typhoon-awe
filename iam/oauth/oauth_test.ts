import { assertEquals } from "$std/assert/assert_equals.ts";
import { parseGithubUser } from "~/iam/oauth/get_github_user.ts";
import { parseGoogleUser } from "~/iam/oauth/get_google_user.ts";

Deno.test("parse_github_user()", async (test) => {
    await test.step("parse github response body", () => {
        const payload = `
        {
            "id": 1,
            "login": "foobar",
            "name": "Foo Bar",
            "avatar_url": "https://avatars.githubusercontent.com/u/1"
        }`;

        const oauthUser = parseGithubUser(JSON.parse(payload));
        assertEquals(Object.keys(oauthUser).length, 4);
        assertEquals(oauthUser.id, "github|1");
        assertEquals(oauthUser.avatar, "https://avatars.githubusercontent.com/u/1");
        assertEquals(oauthUser.login, "foobar"); //?random maybe
        assertEquals(oauthUser.name, "Foo Bar");
    });
});


Deno.test("parse_google_user()", async (test) => {
    await test.step("parse github response body", () => {
        const payload = `
        {
            "id": "1",
            "email": "foobar@gmail.com",
            "name": "Foo Bar",
            "picture": "https://lh3.googleusercontent.com/a/1"
        }`;

        const oauthUser = parseGoogleUser(JSON.parse(payload));
        assertEquals(Object.keys(oauthUser).length, 4);
        assertEquals(oauthUser.id, "google|1");
        assertEquals(oauthUser.avatar, "https://lh3.googleusercontent.com/a/1");
        assertEquals(oauthUser.login, "foobar"); //?random maybe
        assertEquals(oauthUser.name, "Foo Bar");
    });
});