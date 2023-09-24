import { assertEquals } from "$std/assert/assert_equals.ts";
import { assertArrayIncludes } from "$std/assert/assert_array_includes.ts";
import {
    Client,
    Config,
    LibsqlError,
    Row,
    IntMode,
    Value,
    InValue,
} from "~/lib/libsql/deps.ts";
import { createClient } from "./sqlite3.ts";
import { assertRejects } from "$std/assert/assert_rejects.ts";
import { assertExists } from "$std/assert/assert_exists.ts";
import { assert } from "$std/assert/assert.ts";
import { assertObjectMatch } from "$std/assert/assert_object_match.ts";

function withClient(
    fn: (c: Client) => Promise<void>,
    extraConfig: Partial<Config> = {},
): () => Promise<void> {
    return async () => {
        const filename = `counter-${crypto.randomUUID()}.db`;

        const f = await Deno.create(`./${filename}`);
        const c = createClient({ url: `file:${filename}`, ...extraConfig });
        try {
            await fn(c);
        } finally {
            c.close(); f.close();
            await Deno.remove(`./${filename}`);
        }
    };
}

/**
 * FIXME -- need a way to get the columnType
 */
Deno.test("Sqlite3Client()", async (test) => {
    await test.step("execute()", async (test) => {
        await test.step("query a single value", withClient(async (c) => {
            const rs = await c.execute("SELECT 42");
            assertEquals(rs.columns.length, 1);
            assertEquals(rs.rows.length, 1);
            assertEquals(rs.rows[0].length, 1);
            assertEquals(rs.rows[0][0], 42);
        }));

        await test.step("query a single row", withClient(async (c) => {
            const rs = await c.execute("SELECT 1 AS one, 'two' AS two, 0.5 AS three");
            assertArrayIncludes(rs.columns, ["one", "two", "three"]);
            assertEquals(rs.rows.length, 1);
            const r = rs.rows[0];
            assertEquals(r.length, 3);
            assertArrayIncludes(Array.from(r), [1, "two", 0.5]);
            assertArrayIncludes(Object.entries(r), [["one", 1], ["two", "two"], ["three", 0.5]]);
        }));

        await test.step("query multiple rows", withClient(async (c) => {
            const rs = await c.execute("VALUES (1, 'one'), (2, 'two'), (3, 'three')");
            assertEquals(rs.columns.length, 2);
            assertEquals(rs.rows.length, 3);
            assertArrayIncludes(Array.from(rs.rows[0]), [1, "one"]);
            assertArrayIncludes(Array.from(rs.rows[1]), [2, "two"]);
            assertArrayIncludes(Array.from(rs.rows[2]), [3, "three"]);
        }));

        await test.step("statement that produces error", withClient(async (c) => {
            await assertRejects(() => c.execute("SELECT foobar"), LibsqlError/* , "TRANSACTION_CLOSED" */);
        }));

        await test.step("rowsAffected with INSERT", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
            ], "write");
            const rs = await c.execute("INSERT INTO t VALUES (1), (2)");
            assertEquals(rs.rowsAffected, 2);
        }));

        await test.step("rowsAffected with DELETE", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
                "INSERT INTO t VALUES (1), (2), (3), (4), (5)",
            ], "write");
            const rs = await c.execute("DELETE FROM t WHERE a >= 3");
            assertEquals(rs.rowsAffected, 3);
        }));

        await test.step("lastInsertRowid with INSERT", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
                "INSERT INTO t VALUES ('one'), ('two')",
            ], "write");
            const insertRs = await c.execute("INSERT INTO t VALUES ('three')");
            assertExists(insertRs.lastInsertRowid);
            const selectRs = await c.execute({
                sql: "SELECT a FROM t WHERE ROWID = ?",
                args: [insertRs.lastInsertRowid!],
            });
            assertArrayIncludes(Array.from(selectRs.rows[0]), ["three"]);
        }));

        await test.step("rows from INSERT RETURNING", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
            ], "write");

            const rs = await c.execute("INSERT INTO t VALUES (1) RETURNING 42 AS x, 'foo' AS y");
            assertArrayIncludes(rs.columns, ["x", "y"]);
            // assertArrayIncludes(rs.columnTypes, ["", ""]);
            assertEquals(rs.rows.length, 1);
            assertArrayIncludes(Array.from(rs.rows[0]), [42, "foo"]);
        }));
    });

    await test.step("values", async (test) => {
        async function testRoundtrip(
            test: Deno.TestContext,
            name: string,
            passed: InValue,
            expected: Value,
            intMode?: IntMode,
        ): Promise<void> {
            await test.step(name, withClient(async (c) => {
                const rs = await c.execute({ sql: "SELECT ?", args: [passed] });
                assertEquals(rs.rows[0][0], expected);
            }, { intMode }));
        }

        async function testRoundtripError<E extends Error>(
            test: Deno.TestContext,
            name: string,
            passed: InValue,
            expectedError: new (...args: any[]) => E,
            intMode?: IntMode,
        ): Promise<void> {
            await test.step(name, withClient(async (c) => {
                await assertRejects(() => c.execute({
                    sql: "SELECT ?",
                    args: [passed],
                }), expectedError);
            }, { intMode }));
        }

        await testRoundtrip(test, "string", "boomerang", "boomerang");
        await testRoundtrip(test, "string with weird characters", "a\n\r\t ", "a\n\r\t ");
        await testRoundtrip(test, "string with unicode", "žluťoučký kůň úpěl ďábelské ódy", "žluťoučký kůň úpěl ďábelské ódy");

        await test.step("number", async (test) => {
            const intModes: Array<IntMode> = ["number", "bigint", "string"];
            for (const intMode of intModes) {
                await testRoundtrip(test, "zero", 0, 0, intMode);
                await testRoundtrip(test, "integer", -2023, -2023, intMode);
                await testRoundtrip(test, "float", 12.345, 12.345, intMode);
                await testRoundtrip(test, "large positive float", 1e18, 1e18, intMode);
                await testRoundtrip(test, "large negative float", -1e18, -1e18, intMode);
                await testRoundtrip(test, "MAX_VALUE", Number.MAX_VALUE, Number.MAX_VALUE, intMode);
                await testRoundtrip(test, "-MAX_VALUE", -Number.MAX_VALUE, -Number.MAX_VALUE, intMode);
                await testRoundtrip(test, "MIN_VALUE", Number.MIN_VALUE, Number.MIN_VALUE, intMode);
            }
        });

        await test.step("bigint", async (test) => {
            await test.step("'number' int mode", async (test) => {
                await testRoundtrip(test, "zero integer", 0n, 0, "number");
                await testRoundtrip(test, "small integer", -42n, -42, "number");
                await testRoundtrip(test, "largest safe integer", 9007199254740991n, 9007199254740991, "number");
                await testRoundtripError(test, "smallest unsafe integer", 9007199254740992n, RangeError, "number");
                await testRoundtripError(test, "large unsafe integer", -1152921504594532842n, RangeError, "number");
            });

            // FIXME -- `bigint` not working ☹️
            await test.step("'bigint' int mode", async (test) => {
                await testRoundtrip(test, "zero integer", 0n, 0n, "bigint");
                await testRoundtrip(test, "small integer", -42n, -42n, "bigint");
                await testRoundtrip(test, "large positive integer", 1152921504608088318n, 1152921504608088318n, "bigint");
                await testRoundtrip(test, "large negative integer", -1152921504594532842n, -1152921504594532842n, "bigint");
                await testRoundtrip(test, "largest positive integer", 9223372036854775807n, 9223372036854775807n, "bigint");
                await testRoundtrip(test, "largest negative integer", -9223372036854775808n, -9223372036854775808n, "bigint");
            });

            // FIXME -- `bigint` not working ☹️
            await test.step("'string' int mode", async (test) => {
                await testRoundtrip(test, "zero integer", 0n, "0", "string");
                await testRoundtrip(test, "small integer", -42n, "-42", "string");
                await testRoundtrip(test, "large positive integer", 1152921504608088318n, "1152921504608088318", "string");
                await testRoundtrip(test, "large negative integer", -1152921504594532842n, "-1152921504594532842", "string");
                await testRoundtrip(test, "largest positive integer", 9223372036854775807n, "9223372036854775807", "string");
                await testRoundtrip(test, "largest negative integer", -9223372036854775808n, "-9223372036854775808", "string");
            });

            const buf = new ArrayBuffer(256);
            const array = new Uint8Array(buf);
            for (let i = 0; i < 256; ++i) {
                array[i] = i ^ 0xab;
            }
            // FIXME -- seems to fail due to not being Uint8Array
            await testRoundtrip(test, "ArrayBuffer", buf, buf);
            await testRoundtrip(test, "Uint8Array", array, buf);

            await testRoundtrip(test, "null", null, null);
            await testRoundtrip(test, "true", true, 1n, "bigint");
            await testRoundtrip(test, "false", false, 0n, "bigint");

            await testRoundtrip(test, "Date", new Date("2023-01-02T12:34:56Z"), 1672662896000, "bigint");

            // @ts-expect-error dunno why they did this
            await testRoundtripError(test, "undefined produces error", undefined, TypeError);
            await testRoundtripError(test, "NaN produces error", NaN, RangeError);
            await testRoundtripError(test, "Infinity produces error", Infinity, RangeError);
            await testRoundtripError(test, "large bigint produces error", -1267650600228229401496703205376n, RangeError);

            await test.step("max 64-bit bigint", withClient(async (c) => {
                const rs = await c.execute({ sql: "SELECT ?||''", args: [9223372036854775807n] });
                assertEquals(rs.rows[0][0], "9223372036854775807");
            }));

            await test.step("min 64-bit bigint", withClient(async (c) => {
                const rs = await c.execute({ sql: "SELECT ?||''", args: [-9223372036854775808n] });
                assertEquals(rs.rows[0][0], "-9223372036854775808");
            }));
        });
    });

    await test.step("ResultSet.toJSON()", async (test) => {
        await test.step("simple result set", withClient(async (c) => {
            const rs = await c.execute("SELECT 1 AS a");
            const json = rs.toJSON();
            assert(json["lastInsertRowid"] === null || json["lastInsertRowid"] === "0");
            assertEquals(json["columns"], ["a"]);
            assertArrayIncludes(json["columnTypes"], [""]);
            assertArrayIncludes(json["rows"], [[1]]);
            assertEquals(json["rowsAffected"], 0);

            const str = JSON.stringify(rs);
            assert(
                str === '{"columns":["a"],"columnTypes":[""],"rows":[[1]],"rowsAffected":0,"lastInsertRowid":null}' ||
                str === '{"columns":["a"],"columnTypes":[""],"rows":[[1]],"rowsAffected":0,"lastInsertRowid":"0"}'
            );
        }));

        await test.step("lastInsertRowid", withClient(async (c) => {
            await c.execute("DROP TABLE IF EXISTS t");
            await c.execute("CREATE TABLE t (id INTEGER PRIMARY KEY NOT NULL)");
            const rs = await c.execute("INSERT INTO t VALUES (12345)");
            assertObjectMatch(rs.toJSON(), {
                "columns": [],
                "columnTypes": [],
                "rows": [],
                "rowsAffected": 1,
                "lastInsertRowid": "12345",
            });
        }));

        await test.step("computed values", withClient(async (c) => {
            const rs = await c.execute(
                "SELECT 42 AS integer, 0.5 AS float, NULL AS \"null\", 'foo' AS text, X'626172' AS blob",
            );
            const json = rs.toJSON();
            assertArrayIncludes(json["columns"], ["integer", "float", "null", "text", "blob"]);
            assertArrayIncludes(json["columnTypes"], ["", "", "", "", ""]);
            assertArrayIncludes(json["rows"], [[42, 0.5, null, "foo", "YmFy"]]);
        }));

        // FIXME -- Deno treats `number` as `number`, but LibSql wants `string`
        await test.step("bigint row value", withClient(async (c) => {
            const rs = await c.execute("SELECT 42");
            const json = rs.toJSON();
            assertArrayIncludes(json["rows"], [["42"]]);
        }, { intMode: "bigint" }));
    });

    await test.step("arguments", async (test) => {
        await test.step("? arguments", withClient(async (c) => {
            const rs = await c.execute({
                sql: "SELECT ?, ?",
                args: ["one", "two"],
            });
            assertArrayIncludes(Array.from(rs.rows[0]), ["one", "two"]);
        }));

        for (const sign of [":", "@", "$"]) {
            await test.step(`${sign}AAAA arguments`, withClient(async (c) => {
                const rs = await c.execute({
                    sql: `SELECT ${sign}b, ${sign}a`,
                    args: { [`a`]: "one", [`${sign}b`]: "two" },
                });
                assertArrayIncludes(Array.from(rs.rows[0]), ["two", "one"]);
            }));

            await test.step(`${sign}AAAA arguments used multiple times`, withClient(async (c) => {
                const rs = await c.execute({
                    sql: `SELECT ${sign}b, ${sign}a, ${sign}b || ${sign}a`,
                    args: { [`a`]: "one", [`${sign}b`]: "two" },
                });
                assertArrayIncludes(Array.from(rs.rows[0]), ["two", "one", "twoone"]);
            }));

            await test.step(`${sign}AAAA arguments and ?NNN arguments`, withClient(async (c) => {
                const rs = await c.execute({
                    sql: `SELECT ${sign}b, ${sign}a, ?1`,
                    // `a` does not work ☹️ No parameter named ':a'
                    args: { [`a`]: "one", [`${sign}b`]: "two" },
                });
                assertArrayIncludes(Array.from(rs.rows[0]), ["two", "one", "two"]);
            }));
        }
    });

    await test.step("batch()", async (test) => {
        await test.step("multiple queries", withClient(async (c) => {
            const rss = await c.batch([
                "SELECT 1+1",
                "SELECT 1 AS one, 2 AS two",
                { sql: "SELECT ?", args: ["boomerang"] },
                { sql: "VALUES (?), (?)", args: ["big", "ben"] },
            ], "read");

            assertEquals(rss.length, 4);
            const [rs0, rs1, rs2, rs3] = rss;

            assertEquals(rs0.rows.length, 1);
            assertArrayIncludes(Array.from(rs0.rows[0]), [2]);

            assertEquals(rs1.rows.length, 1);
            assertArrayIncludes(Array.from(rs1.rows[0]), [1, 2]);

            assertEquals(rs2.rows.length, 1);
            assertArrayIncludes(Array.from(rs2.rows[0]), ["boomerang"]);

            assertEquals(rs3.rows.length, 2);
            assertArrayIncludes(Array.from(rs3.rows[0]), ["big"]);
            assertArrayIncludes(Array.from(rs3.rows[1]), ["ben"]);
        }));

        await test.step("statements are executed sequentially", withClient(async (c) => {
            const rss = await c.batch([
                /* 0 */ "DROP TABLE IF EXISTS t",
                /* 1 */ "CREATE TABLE t (a, b)",
                /* 2 */ "INSERT INTO t VALUES (1, 'one')",
                /* 3 */ "SELECT * FROM t ORDER BY a",
                /* 4 */ "INSERT INTO t VALUES (2, 'two')",
                /* 5 */ "SELECT * FROM t ORDER BY a",
                /* 6 */ "DROP TABLE t",
            ], "write");

            assertEquals(rss.length, 7);
            assertArrayIncludes(rss[3].rows, [{ a: 1, b: "one" }] as unknown as Row[]);
            assertArrayIncludes(rss[5].rows, [{ a: 1, b: "one" }, { a: 2, b: "two" }] as unknown as Row[]);
        }));

        // FIXME -- hangs ☹️
        /* await test.step("statements are executed in a transaction", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t1",
                "DROP TABLE IF EXISTS t2",
                "CREATE TABLE t1 (a)",
                "CREATE TABLE t2 (a)",
            ], "write");

            const n = 100;
            const promises = [];
            for (let i = 0; i < n; ++i) {
                const ii = i;
                // deno-lint-ignore no-explicit-any
                promises.push((async (): Promise<any> => {
                    const rss = await c.batch([
                        { sql: "INSERT INTO t1 VALUES (?)", args: [ii] },
                        { sql: "INSERT INTO t2 VALUES (?)", args: [ii * 10] },
                        "SELECT SUM(a) FROM t1",
                        "SELECT SUM(a) FROM t2",
                    ], "write");

                    const sum1 = rss[2].rows[0][0] as number;
                    const sum2 = rss[3].rows[0][0] as number;
                    assertEquals(sum2, sum1 * 10);
                })());
            }
            await Promise.all(promises);

            const rs1 = await c.execute("SELECT SUM(a) FROM t1");
            assertEquals(rs1.rows[0][0], n * (n - 1) / 2);
            const rs2 = await c.execute("SELECT SUM(a) FROM t2");
            assertEquals(rs2.rows[0][0], n * (n - 1) / 2 * 10);
        })); */

        await test.step("error in batch", withClient(async (c) => {
            await assertRejects(() => c.batch([
                "SELECT 1+1",
                "SELECT foobar",
            ], "read"), LibsqlError);
        }));

        await test.step("error in batch rolls back transaction", withClient(async (c) => {
            await c.execute("DROP TABLE IF EXISTS t");
            await c.execute("CREATE TABLE t (a)");
            await c.execute("INSERT INTO t VALUES ('one')");
            await assertRejects(() => c.batch([
                "INSERT INTO t VALUES ('two')",
                "SELECT foobar",
                "INSERT INTO t VALUES ('three')",
            ], "write"), LibsqlError);

            const rs = await c.execute("SELECT COUNT(*) FROM t");
            assertEquals(rs.rows[0][0], 1);
        }));

        await test.step("batch with a lot of different statements", withClient(async (c) => {
            const stmts = [];
            for (let i = 0; i < 1000; ++i) {
                stmts.push(`SELECT ${i}`);
            }
            const rss = await c.batch(stmts, "read");
            for (let i = 0; i < stmts.length; ++i) {
                assertEquals(rss[i].rows[0][0], i);
            }
        }));

        await test.step("batch with a lot of the same statements", withClient(async (c) => {
            const n = 20;
            const m = 200;

            const stmts = [];
            for (let i = 0; i < n; ++i) {
                for (let j = 0; j < m; ++j) {
                    stmts.push({ sql: `SELECT ?, ${j}`, args: [i] });
                }
            }

            const rss = await c.batch(stmts, "read");
            for (let i = 0; i < n; ++i) {
                for (let j = 0; j < m; ++j) {
                    const rs = rss[i * m + j];
                    assertEquals(rs.rows[0][0], i);
                    assertEquals(rs.rows[0][1], j);
                }
            }
        }));

        await test.step("deferred batch", withClient(async (c) => {
            const rss = await c.batch([
                "SELECT 1+1",
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
                "INSERT INTO t VALUES (21) RETURNING 2*a",
            ], "deferred");

            assertEquals(rss.length, 4);
            const [rs0, _rs1, _rs2, rs3] = rss;

            assertEquals(rs0.rows.length, 1);
            assertArrayIncludes(Array.from(rs0.rows[0]), [2]);

            assertEquals(rs3.rows.length, 1);
            assertArrayIncludes(Array.from(rs3.rows[0]), [42]);
        }));
    });

    await test.step("transaction()", async (test) => {
        await test.step("query multiple rows", withClient(async (c) => {
            const txn = await c.transaction("read");

            const rs = await txn.execute("VALUES (1, 'one'), (2, 'two'), (3, 'three')");
            assertEquals(rs.columns.length, 2);
            // expect(rs.columnTypes.length).toStrictEqual(2);
            assertEquals(rs.rows.length, 3);

            assertArrayIncludes(Array.from(rs.rows[0]), [1, "one"]);
            assertArrayIncludes(Array.from(rs.rows[1]), [2, "two"]);
            assertArrayIncludes(Array.from(rs.rows[2]), [3, "three"]);

            txn.close();
        }));

        await test.step("commit()", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
            ], "write");

            const txn = await c.transaction("write");
            await txn.execute("INSERT INTO t VALUES ('one')");
            await txn.execute("INSERT INTO t VALUES ('two')");
            assertEquals(txn.closed, false);
            await txn.commit();
            assertEquals(txn.closed, true);

            const rs = await c.execute("SELECT COUNT(*) FROM t");
            assertEquals(rs.rows[0][0], 2);
            await assertRejects(() => txn.execute("SELECT 1"), LibsqlError);
        }));

        await test.step("rollback()", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
            ], "write");

            const txn = await c.transaction("write");
            await txn.execute("INSERT INTO t VALUES ('one')");
            await txn.execute("INSERT INTO t VALUES ('two')");
            assertEquals(txn.closed, false);
            await txn.rollback();
            assertEquals(txn.closed, true);

            const rs = await c.execute("SELECT COUNT(*) FROM t");
            assertEquals(rs.rows[0][0], 0);
            await assertRejects(() => txn.execute("SELECT 1"), LibsqlError);
        }));

        await test.step("close()", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
            ], "write");

            const txn = await c.transaction("write");
            await txn.execute("INSERT INTO t VALUES ('one')");
            assertEquals(txn.closed, false);
            txn.close();
            assertEquals(txn.closed, true);

            const rs = await c.execute("SELECT COUNT(*) FROM t");
            assertEquals(rs.rows[0][0], 0);
            await assertRejects(() => txn.execute("SELECT 1"), LibsqlError);
        }));

        await test.step("error does not rollback", withClient(async (c) => {
            await c.batch([
                "DROP TABLE IF EXISTS t",
                "CREATE TABLE t (a)",
            ], "write");

            const txn = await c.transaction("write");
            await assertRejects(() => txn.execute("SELECT foo"), LibsqlError);
            await txn.execute("INSERT INTO t VALUES ('one')");
            await assertRejects(() => txn.execute("SELECT bar"), LibsqlError);
            await txn.commit();

            const rs = await c.execute("SELECT COUNT(*) FROM t");
            assertEquals(rs.rows[0][0], 1);
        }));


        await test.step("commit empty", withClient(async (c) => {
            const txn = await c.transaction("read");
            await txn.commit();
        }));

        await test.step("rollback empty", withClient(async (c) => {
            const txn = await c.transaction("read");
            await txn.rollback();
        }));

        await test.step("batch()", async (test) => {
            await test.step("as the first operation on transaction", withClient(async (c) => {
                const txn = await c.transaction("write");

                await txn.batch([
                    "DROP TABLE IF EXISTS t",
                    "CREATE TABLE t (a)",
                    { sql: "INSERT INTO t VALUES (?)", args: [1] },
                    { sql: "INSERT INTO t VALUES (?)", args: [2] },
                    { sql: "INSERT INTO t VALUES (?)", args: [4] },
                ]);

                const rs = await txn.execute("SELECT SUM(a) FROM t");
                assertEquals(rs.rows[0][0], 7);
                txn.close();
            }));

            await test.step("as the second operation on transaction", withClient(async (c) => {
                const txn = await c.transaction("write");

                await txn.execute("DROP TABLE IF EXISTS t");
                await txn.batch([
                    "CREATE TABLE t (a)",
                    { sql: "INSERT INTO t VALUES (?)", args: [1] },
                    { sql: "INSERT INTO t VALUES (?)", args: [2] },
                    { sql: "INSERT INTO t VALUES (?)", args: [4] },
                ]);

                const rs = await txn.execute("SELECT SUM(a) FROM t");
                assertEquals(rs.rows[0][0], 7);
                txn.close();
            }));

            // FIXME -- seems to expect `31` when it should be `7`
            await test.step("after error, further statements are not executed", withClient(async (c) => {
                const txn = await c.transaction("write");

                await assertRejects(() => txn.batch([
                    "DROP TABLE IF EXISTS t",
                    "CREATE TABLE t (a UNIQUE)",
                    "INSERT INTO t VALUES (1), (2), (4)",
                    "INSERT INTO t VALUES (1)",
                    "INSERT INTO t VALUES (8), (16)",
                ]), LibsqlError);

                const rs = await txn.execute("SELECT SUM(a) FROM t");
                assertEquals(rs.rows[0][0], 7);

                await txn.commit();
            }));
        });
    });
});