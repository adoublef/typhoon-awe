import {
    Client,
    Config,
    ExpandedConfig,
    _createHttpClient,
    _createWsClient,
    expandConfig,
} from "~/lib/libsql/deps.ts";
import { _createClient as _createSqlite3Client } from "~/lib/libsql/sqlite3.ts";

export function createClient(config: Config): Client {
    return _createClient(expandConfig(config, true));
}

/** @private */
export function _createClient(config: ExpandedConfig): Client {
    if (config.scheme === "ws" || config.scheme === "wss") {
        return _createWsClient(config);
    } else if (config.scheme === "http" || config.scheme === "https") {
        return _createHttpClient(config);
    } else {
        return _createSqlite3Client(config);
    }
}