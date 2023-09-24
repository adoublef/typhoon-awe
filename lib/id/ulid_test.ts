import { Ulid } from "./ulid.ts";
import { assertEquals } from "$std/assert/assert_equals.ts";

Deno.test("Ulid()", async (test) => {
    await test.step("generate random id", () => {
        const a = new Ulid();
        assertEquals(a.length, 26);
    });

    await test.step("generate Id object from raw string", () => {
        const raw = "01ARYZ6S41YYYYYYY0YYYYYYZ1";
        const a = new Ulid(raw);
        assertEquals(a.length, 26);
    });

    await test.step("localCompare()", async (test) => {
        await test.step("a comes before b", () => {
            const a = new Ulid("01ARYZ6S41YYYYYYY0YYYYYYZ1");
            const b = new Ulid();

            assertEquals(a.localeCompare(b), -1);
        });
    });
});
