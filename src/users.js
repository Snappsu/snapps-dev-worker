import { env } from "cloudflare:workers";
import * as  messanger from "./messenger" ;
import * as  database from "./database" ;

// =========================
// === Look Up Functions ===
// =========================

// get user by discord_username
export async function getUserByDiscordUsername(discordUsername) {
    // default payload
    var payload = {status:null,data:null}

    // run query
    const result = await database.runQuery("SNAPPS_DEV_DB",`select * from users where discord_username="${discordUsername}"`)
    
    // if query success
    if (result.status == "ok"){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.data
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
    const result = await database.runQuery("SNAPPS_DEV_DB",`select * from users where discord_id="${discordID}"`)

    // if query success
    if (result.status == "ok"){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.data
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
    const result = await database.runQuery("SNAPPS_DEV_DB",`select * from users where uuid="${uuid}"`)
    
    // if query success
    if (result.status == "ok"){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.data
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
    const result = await database.runQuery("SNAPPS_DEV_DB",query)
    
    // if query success
    if (result.status == "ok"){
        // add requests to payload
        payload.status = "ok"
        payload.data = result.data
    } else {
        // get error data
    }

    // return payload
    return payload
} 

// =========================
// === User Registration ===
// =========================

// ======================
// === Util Functions ===
// ======================

export function isVerified(userData){
    return userData.verified==1
}

export function isBanned(userData){
    return userData.banned==1
}

export function isPrivate(userData){
    return userData.private==1
}

export function getUserAvatarURL(userData){
    var extension = "png" // default extention
    if (userData.icon.substring(0,2) == "a_") extension = "gif"
    return `https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.icon}.${extension}`
}