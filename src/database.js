// -------------------
// --- database.js ---
// -------------------

// Just some utility functions to make working with databases easier
// This assumes databases can be accessed from env

import { WorkerEntrypoint } from "cloudflare:workers";
import { env } from "cloudflare:workers";

export async function runQuery(database,query) {

    // default payload
    var payload = {status:null,data:null}

    // run query
    const result = await env[database].prepare(query).run();

    // if query success
    if (result.success){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.results
    } else {
        // get error data
        payload.status = "error"
        payload.data = "something went wrong while running query"
    }

    // return payload
    return payload
} 