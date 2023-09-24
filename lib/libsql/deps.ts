/* std */
export { encode } from "$std/encoding/base64.ts";
/* libsql */
export {
    LibsqlError,
    type Config,
    type Client,
    type IntMode,
    type InStatement,
    type InArgs,
    type InValue,
    type ResultSet,
    type Row,
    type Transaction,
    type TransactionMode,
    type Value,
} from "$libsql-client-ts/api.js";
export {
    expandConfig,
    type ExpandedConfig,
} from "$libsql-client-ts/config.js";
export { _createClient as _createWsClient } from "$libsql-client-ts/ws";
export { _createClient as _createHttpClient } from "$libsql-client-ts/http";
import Database from "npm:libsql@0.1.13";
export { Database };