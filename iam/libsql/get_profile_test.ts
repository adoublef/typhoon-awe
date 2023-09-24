import { assertExists } from "$std/assert/assert_exists.ts";
import { assertEquals } from "$std/assert/assert_equals.ts";
import { withClient } from "~/iam/libsql/_with_client.ts";
import { addUser } from "~/iam/libsql/add_user.ts";
import { getProfile } from "~/iam/libsql/get_profile.ts";

Deno.test("get_profile()", async (test) => {
    await test.step("get profile with login credentials", withClient(async (c) => {
        await addUser(c, { display: "adoublef", login: "passw|1234567890", image: "avatar.example.com/adoublef" });

        const found = await getProfile(c, "passw|1234567890");
        assertExists(found);
        assertEquals(found.display, "adoublef");
    }));
});