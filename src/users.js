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

// ================================
// === User Flags + Permissions ===
// ================================

export class flags {
    totalBits = 4
    
    banned   =    0b1
    verified =   0b10 
    private  =  0b100 
    kinky    = 0b1000
}

export class permissions {
    totalBits = 2

    requests =  0b1
    asks     = 0b10 
}


export function isVerified(userData){
    return Boolean(userData.flags&flags.verified)
}

export function isBanned(userData){
    return Boolean(userData.flags&flags.banned)
}

export function isPrivate(userData){
    return Boolean(userData.flags&flags.private)
}

export function isKinky(userData){
    return Boolean(userData.flags&flags.kinky)
}

// ======================
// === Util Functions ===
// ======================

export function getUserAvatarURL(userData){
    var extension = "png" // default extention
    if (userData.icon.substring(0,2) == "a_") extension = "gif"
    return `https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.icon}.${extension}`
}