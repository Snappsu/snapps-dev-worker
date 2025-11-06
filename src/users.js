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
        code: discordAuthorizationToken,
        grant_type: 'authorization_code',
        client_id: env.DISCORD_BOT_ID,
        client_secret: env.DISCORD_BOT_SECRET,
        redirect_uri: redirect_uri
    })
    };

    fetch('https://discord.com/api/oauth2/token', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));
    
    // get users' discord info
    var userDiscordInfo = {}
    var discordAccessToken = ""

    options = {
    method: 'GET',
    headers: {
        Authorization: `Bearer ${discordAccessToken}`
    }
    };

    fetch('https://discord.com/api/users/@me', options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));


    // setup user info
    const uuid = crypto.randomUUID()
    const iat = Date.now()

    // add user to db
    //const query = `INSERT INTO "main"."users" ("uuid", "discord_id", "discord_username", "nickname", "email", "icon", "created_at", "flags", "permissions", "title") VALUES('${uuid}', '${discord_id}', '${discord_username}', NULL, NULL, '${icon}', ${iat}, ${flags}, ${permissions}, NULL) RETURNING rowid, *`

    // verify user if in server

    // notify me 
    await messanger.sendToDiscordWebhook(env.DISCORD_WEBHOOK_TEST_CHAT,{content:`new user made`});
    

    // return payload
    return payload
}


// =========================
// === user modification ===
// =========================

// set private

// set kinky

// verify user
export async function verifyUser(userID){}

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