import { env } from "cloudflare:workers";
import * as  messanger from "./messenger" ;
import * as  database from "./database" ;

// =========================
// === look up functions ===
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
// === user registration ===
// =========================

// create user via discord
export async function createUserViaDiscord(discordAuthorizationToken,redirect_uri){
    // default payload
    var payload = {status:null,data:null}

    // get access token
    var options = {
    method: 'POST',
    body: new URLSearchParams({
        code: `${discordAuthorizationToken}`,
        grant_type: 'authorization_code',
        client_id: env.DISCORD_BOT_ID,
        client_secret: env.DISCORD_BOT_SECRET,
        redirect_uri: redirect_uri
    })
    };

    var authRequest = await fetch('https://discord.com/api/oauth2/token', options).catch(err => console.error(err));
    var authResponse = await authRequest.json()
    var discordAccessToken = authResponse.access_token;

    // error checking
    if (authRequest.status != 200){
        // log error
        var error = "something went wrong while getting access token"
        if ("error_description" in authResponse) error += ": " + authResponse.error_description;
        console.error(error)
        // set up payload
        payload.status="error"
        payload.data=error
        // abort 
        return payload
    }

    // get users' discord info
    options = {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${discordAccessToken}`
    }
    };

    var userRequest = await fetch('https://discord.com/api/users/@me', options)
    .catch(err => console.error(err));
    var userResponse = await userRequest.json()

    // error checking
    if (userRequest.status != 200){
        // log error
        var error = "something went wrong while getting discord user info"
        if ("error_description" in userResponse) error += ": " + authResponse.error_description;
        console.error(error)
        // set up payload
        payload.status="error"
        payload.data=error
        // abort 
        return payload
    }

    // setup user info
    const uuid = crypto.randomUUID()
    const iat = Date.now()

    const discord_id = userResponse.id
    const discord_username = userResponse.username
    const icon = userResponse.avatar

    // add user to db
    const query = `INSERT INTO "main"."users" ("uuid", "discord_id", "discord_username", "nickname", "email", "icon", "created_at", "flags", "permissions", "title") VALUES('${uuid}', '${discord_id}', '${discord_username}', NULL, NULL, '${icon}', ${iat}, ${flags}, ${permissions}, NULL) RETURNING rowid, *`

    // verify user if in server
    

    // notify me 
    await messanger.sendToDiscordWebhook(env.DISCORD_WEBHOOK_TEST_CHAT,{content:`new user made`});
    

    // return payload
    return payload
}


// =========================
// === user modification ===
// =========================

// add flags
export async function addFlags(discordID,flagBits){
    // default payload
    var payload = {status:null,data:null}
    
    // get user flags 
    const getFlagQuery = `select "flags" from users where "discord_id"="${discordID}"`
    var response = await database.runQuery("SNAPPS_DEV_DB",getFlagQuery)
    var currentFlags = response.data[0].flags

    // OR the bits
    const newFlags = currentFlags|flagBits

    // set user flags
    const setFlagQuery = `UPDATE "users" SET "flags" = '${newFlags} 'WHERE "discord_id" = '${discordID}' RETURNING rowid, *`
    var response = await database.runQuery("SNAPPS_DEV_DB",setFlagQuery)

    // return payload
    payload.status="ok"
    payload.data=newFlags
    return payload
}

// revoke flags
export async function removeFlags(discordID,flagBits){
    // default payload
    var payload = {status:null,data:null}
    
    // get user flags 
    const getFlagQuery = `select "flags" from users where "discord_id"="${discordID}"`
    var response = await database.runQuery("SNAPPS_DEV_DB",getFlagQuery)
    var currentFlags = response.data[0].flags

    // create mask
    var mask = bitmask(flags.totalBits)^flagBits
    // XOR the bits

    const newFlags = currentFlags&mask

    // set user flags
    const setFlagQuery = `UPDATE "users" SET "flags" = '${newFlags} 'WHERE "discord_id" = '${discordID}' RETURNING rowid, *`
    var response = await database.runQuery("SNAPPS_DEV_DB",setFlagQuery)

    // return payload
    payload.status="ok"
    payload.data=newFlags
    return payload
}

// set flags
export async function setFlags(discordID,flagBits){
    // default payload
    var payload = {status:null,data:null}

    // set user flags
    const setFlagQuery = `UPDATE "users" SET "flags" = '${flagBits} 'WHERE "discord_id" = '${discordID}' RETURNING rowid, *`
    await database.runQuery("SNAPPS_DEV_DB",setFlagQuery)

    // return payload
    payload.status="ok"
    payload.data=flagBits
    return payload
}

// ================================
// === user flags + permissions ===
// ================================

class flags {
    static totalBits = 4
    
    static banned   =    0b1
    static verified =   0b10 
    static private  =  0b100 
    static kinky    = 0b1000
}

class permissions {
    static totalBits = 2

    static requests =  0b1
    static asks     = 0b10 
}

// flag check functions

export function isVerified(userData){
    console.log(flags.verified)
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

// permission check functions

export function canMakeRequests(userData){
    return Boolean(userData.permissions&permissions.requests)
}

export function canMakeAsks(userData){
    return Boolean(userData.permissions&permissions.asks)
}


// ======================
// === util functions ===
// ======================

export function getUserAvatarURL(userData){
    var extension = "png" // default extention
    if (userData.icon.substring(0,2) == "a_") extension = "gif"
    return `https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.icon}.${extension}`
}

export function mentionUserDiscord(userData){
    return `<@${userData.discord_id}>`
}

function bitmask(width) {
    return Math.pow(2, width) - 1;
}