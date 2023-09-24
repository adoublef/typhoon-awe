import type { PipeResult } from '$valibot/src/types.ts';

/**
 * Creates a validation functions that validates a [ULID](https://github.com/ulid/spec).
 *
 * @param error The error message.
 *
 * @returns A validation function.
 */
export function ulid<TInput extends string>(error?: string) {
    return (input: TInput): PipeResult<TInput> => {
        if (
            !/^[0-9A-HJKMNPQ-TV-Z]{26}$/i.test(input)
        ) {
            return {
                issue: {
                    validation: "uuid",
                    message: error || "Invalid ULID",
                    input
                }
            };
        };
        return { output: input };
    };
}
