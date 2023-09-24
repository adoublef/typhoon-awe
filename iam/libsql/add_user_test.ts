import { assertExists } from "$std/assert/assert_exists.ts";
import { assertRejects } from "$std/assert/assert_rejects.ts";
import { withClient } from "~/iam/libsql/_with_client.ts";
import { addUser } from "~/iam/libsql/add_user.ts";

Deno.test("add_user()", async (test) => {
    await test.step("add user's profile and credentials", withClient(async (c) => {
        const id = await addUser(c, { display: "adoublef", login: "passw|1234567890", image: "avatar.example.com/adoublef" });
        assertExists(id);
    }));

    await test.step("fail to add duplicate display", withClient(async (c) => {
        const id = await addUser(c, { display: "adoublef", login: "passw|1234567890" });
        assertExists(id);

        await assertRejects(() => addUser(c, { display: "adoublef", login: "passw|0123456789" }));
    }));

    await test.step("fail to add duplicate display", withClient(async (c) => {
        const id = await addUser(c, { display: "adoublef", login: "passw|1234567890", image: "avatar.example.com/adoublef" });
        assertExists(id);

        await assertRejects(() => addUser(c, { display: "eponqlat", login: "passw|1234567890" }));
    }));
});