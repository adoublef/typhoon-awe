import { assertExists } from "$std/assert/assert_exists.ts";
import { assertEquals } from "$std/assert/assert_equals.ts";
import { parseCredentials, parseProfile } from "~/iam/iam.ts";
import { Ulid } from "~/lib/id/ulid.ts";

Deno.test("parse_profile()", async (test) => {
    await test.step("valid input data", (test) => {
        const input = {
            display: "adoublef",
            name: "Kristopher Rahim",
        };
        const output = parseProfile(input);
        assertExists(output.id);
    });
});

Deno.test("parse_credentials()", async (test) => {
    await test.step("valid input data", () => {
        const input = {
            profile: new Ulid().toString(),
            login: "passw|1234567890",
        };
        const output = parseCredentials(input);
        assertEquals(input.profile, output.profile.toString());
    });
});