// -------------------
// --- database.js ---
// -------------------

// Just some utility functions to make working with databases easier
// This assumes databases can be accessed from env

import { WorkerEntrypoint } from "cloudflare:workers";
import { env } from "cloudflare:workers";

export async function runQuery(database,query) {

    console.log(`running query "${query}" against "${database}"...` )

    // default payload
    var payload = {status:null,data:null}

    // run query
    const result = await env[database].prepare(query).run();

    // if query success
    if (result.success){
        // add requests to payload
        payload.status = "ok"
        result.results.length==1?payload.data = result.results[0]:payload.data = result.results
        if(result.results.length==0)payload.data = null
        console.log("query successful!")
    } else {
        // get error data
        payload.status = "error"
        payload.data = "something went wrong while running query"
        console.error("something went wrong while running query!")
    }

    // return payload
    return payload
} 