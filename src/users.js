import { env } from "cloudflare:workers";
import * as  messanger from "./messenger" ;

// get user by discord_username
export async function getUserByDiscordUsername(discordUsername) {
    // default payload
    var payload = {status:null,data:null}

    // run query
    const result = await env.SNAPPS_DEV_DB.prepare(
        `select * from users where discord_username="${discordUsername}"`,
    ).run();
    console.log(JSON.stringify(result))

    // if query success
    if (result.success){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.results
    } else {
        // get error data
    }

    // return payload
    return payload
} 

// get user by discord_id
export async function getUserByDiscordID(discordID) {
    // default payload
    var payload = {status:null,data:null}

    // run query
    const result = await env.SNAPPS_DEV_DB.prepare(
        `select * from users where discord_id="${discordID}"`,
    ).run();
    console.log(JSON.stringify(result))

    // if query success
    if (result.success){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.results
    } else {
        // get error data
    }

    // return payload1
    return payload
} 

// get user by discord_id
export async function getUserByUUID(uuid) {
    // default payload
    var payload = {status:null,data:null}

    // run query
    const result = await env.SNAPPS_DEV_DB.prepare(
        `select * from users where uuid="${uuid}"`,
    ).run();
    console.log(JSON.stringify(result))

    // if query success
    if (result.success){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.results
    } else {
        // get error data
    }

    // return payload
    return payload
} 

// list users
export async function listUsers(sort="iat",limit=25,page=1) {
    // default payload
    var payload = {status:null,data:null}

    // set up query
    if (sort="iat") sort = "created_at";
    var query = ` SELECT * FROM users WHERE PRIVATE = 0 ORDER BY ${sort} LIMIT ${limit} OFFSET ${((page-1)*limit)}`

    // run query
    const result = await env.SNAPPS_DEV_DB.prepare(query,).run();
    console.log(JSON.stringify(result))

    // if query success
    if (result.success){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.results
    } else {
        // get error data
    }

    // return payload
    return payload
} 