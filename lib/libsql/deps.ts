/* std */
export { encodeBase64 } from "$std/encoding/base64.ts";
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
} from "$libsql/api";
export {
    expandConfig,
    type ExpandedConfig,
} from "$libsql/config";
export { _createClient as _createWsClient } from "$libsql/ws";
export { _createClient as _createHttpClient } from "$libsql/http";
import Database from "npm:libsql@0.1.13";
export { Database };