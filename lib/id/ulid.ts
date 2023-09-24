import { decodeTime, ulid as create, PipeResult } from "./deps.ts";
import { assert } from "$std/assert/assert.ts";

/** TODO */
export class Ulid {
    #value: string;

    constructor(id?: string) {
        try {
            if (id) {
                assert(decodeTime(id));
                this.#value = id;
            } else {
                this.#value = create();
            }
        } catch (error) {
            if (!(error instanceof Error)) {
                throw Error("unrecognized error", { cause: error });
            }

            throw new TypeError(`${error.message}`);
        }
    }
    /** String representation of an Id */
    toString(): string {
        return this.#value.toString();
    }
    /** JSON representation of an Id */
    toJSON(): string {
        return this.#value;
    }
    /** Length returns the size of the Id */
    get length() {
        return this.#value.length;
    }
    // https://github.com/oklog/ulid/blob/main/ulid.go#L480C1-L484C2
    localeCompare(other: Ulid): number {
        return this.#value.localeCompare(other.#value);
    }

    static localeCompare(a: Ulid, b: Ulid): number {
        return a.localeCompare(b);
    }

    /** Creates a string representation of an Id */
    static toString(): string {
        return new Ulid().toString();
    }

    static isUlid(id: string) {
        try {
            assert(decodeTime(id));
            return true;
        } catch {
            return false;
        }
    }
}