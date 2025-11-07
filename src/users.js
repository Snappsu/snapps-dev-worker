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

    var authRequest = await fetch(`${env.DISCORD_API_BASE_URL}/oauth2/token`, options).catch(err => console.error(err));
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

    var userRequest = await fetch(`${env.DISCORD_API_BASE_URL}/users/@me`, options)
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

    // revoke token

    // check if user is already registered
    var userData = (await getUserByDiscordID(userResponse.id)).data
    if (userData.length !=0) {
        payload.status = "error"
        payload.data = "seems like you're already registered"
        return payload
    }

    // setup user info
    const uuid = crypto.randomUUID()
    const iat = Date.now()

    const discord_id = userResponse.id
    const discord_username = userResponse.username
    const icon = userResponse.avatar

    // add user to db
    const query = `INSERT INTO "main"."users" ("uuid", "discord_id", "discord_username", "nickname", "email", "icon", "created_at", "flags", "permissions", "title") VALUES('${uuid}', '${discord_id}', '${discord_username}', NULL, NULL, '${icon}', ${iat}, 0, 0, NULL) RETURNING rowid, *`
    userData =  (await database.runQuery("SNAPPS_DEV_DB",query)).data[0]
    console.log(userData)

    // verify user if in server
    userData = (await upateUserViaDiscordServer(userData))

    // notify me 
    await messanger.sendToDiscordWebhook(env.DISCORD_WEBHOOK_TEST_CHAT,{content:`\`\`\`json\n${JSON.stringify(userData)}\`\`\``}); //PREPROD
    
    // return payload
    payload.status = "ok"
    payload.data = userData
    return payload
}

// =========================
// === user modification ===
// =========================

// update user info using discord server info
export async function upateUserViaDiscordServer(userData){

    // default payload
    var payload = {status:null,data:null}

    console.log(`attempting to update user ${userData.uuid}...`)

    // get members user info from server
    var discordUserData;
    const url = `${env.DISCORD_API_BASE_URL}/guilds/${env.DISCORD_TEST_SERVER_ID}/members/${userData.discord_id}`; //PREPROD

    var options = {
        method: 'GET',
        headers: {
            Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`
        }
    };

    const response = await fetch(url, options);
    try { 
        discordUserData = await response.json();
        console.log(discordUserData);
    } catch (error) {
        console.error(error);
        payload.status="error"
        payload.data=error
        return payload
    }

    // set up vars
    var username = discordUserData.user.username
    var nickname = null
    var icon = discordUserData.user.avatar
    
    // if user in server
    if (response.status==200){
         console.log(`user is in server...`)
        if(discordUserData.nick) var nickname = discordUserData.nick
        if(discordUserData.avatar) var icon = discordUserData.avatar
    }

    // if user is verified
    if (discordUserData.roles.includes(env.DISCORD_TEST_VERIFIED_ROLE_ID)){ //PREPROD
        console.log(`user is verified...`)
        userData = addFlags(userData,flags.verified)
    }

    // grant default perms 
    userData = await users.grantDefaultPerms(user)

    // run update query
    const query =`UPDATE "main"."users" SET "discord_username" = '${username}', "nickname" = ${nickname?`'${nickname}'`:"NULL"}, "icon" = ${icon?`'${icon}'`:"NULL"} WHERE "uuid" = '${userData.uuid}' RETURNING *`
    userData = (await database.runQuery("SNAPPS_DEV_DB",query)).data[0]
    
    // return payload
    payload.status="ok"
    payload.data = userData
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

// add flags
export async function addFlags(userData,flagBits){
    // default payload
    var payload = {status:null,data:null}
    
    // get user flags 
    var currentFlags = userData.flags

    // OR the bits
    const newFlags = currentFlags|flagBits

    // set user flags
    const setFlagQuery = `UPDATE "users" SET "flags" = '${newFlags} 'WHERE "uuid" = '${userData.uuid}' RETURNING rowid, *`
    var response = await database.runQuery("SNAPPS_DEV_DB",setFlagQuery)

    // return payload
    payload.status="ok"
    payload.data=response.data[0]
    return payload
}

// revoke flags
export async function removeFlags(userData,flagBits){
    // default payload
    var payload = {status:null,data:null}
    
    // get user flags 
    var currentFlags = userData.flags

    // create mask
    var mask = bitmask(flags.totalBits)^flagBits
    // XOR the bits

    const newFlags = currentFlags&mask

    // set user flags
    const setFlagQuery = `UPDATE "users" SET "flags" = '${newFlags} 'WHERE "uuid" = '${userData.uuid}' RETURNING *`
    var response = await database.runQuery("SNAPPS_DEV_DB",setFlagQuery)

    // return payload
    payload.status="ok"
    payload.data=response.data[0]
    return payload
}

// set flags
export async function setFlags(userData,flagBits){
    // default payload
    var payload = {status:null,data:null}

    // set user flags
    const setFlagQuery = `UPDATE "users" SET "flags" = '${flagBits} 'WHERE "uuid" = '${userData.uuid}' RETURNING *`
    await database.runQuery("SNAPPS_DEV_DB",setFlagQuery)

    // return payload
    payload.status="ok"
    payload.data=response.data[0]
    return payload
}


// permission check functions

export function canMakeRequests(userData){
    return Boolean(userData.permissions&permissions.requests)
}

export function canMakeAsks(userData){
    return Boolean(userData.permissions&permissions.asks)
}

// add perms
export async function addPerms(userData,permBits){
    // default payload
    var payload = {status:null,data:null}
    
    // get user perms 
    var currentPerms = userData.permissions

    // OR the bits
    const newPerms = currentPerms|permBits

    // set user perms
    const setPermQuery = `UPDATE "users" SET "permission" = '${newPerms} 'WHERE "uuid" = '${userData.uuid}' RETURNING rowid, *`
    var response = await database.runQuery("SNAPPS_DEV_DB",setPermQuery)

    // return payload
    payload.status="ok"
    payload.data=response.data[0]
    return payload
}

// revoke perms
export async function removePerms(userData,permBits){
    // default payload
    var payload = {status:null,data:null}

    // get user perms 
    var currentPerms = userData.permissions

    // create mask
    var mask = bitmask(perms.totalBits)^permBits
    // XOR the bits

    const newPerms = currentPerms&mask

    // set user perms
    const setPermQuery = `UPDATE "users" SET "permissions" = '${newPerms} 'WHERE "uuid" = '${userData.uuid}' RETURNING *`
    var response = await database.runQuery("SNAPPS_DEV_DB",setPermQuery)

    // return payload
    payload.status="ok"
    payload.data=response.data[0]
    return payload
}

// set perms
export async function setPerms(userData,permBits){
    // default payload
    var payload = {status:null,data:null}

    // set user perms
    const setPermQuery = `UPDATE "users" SET "permissions" = '${permBits} 'WHERE "uuid" = '${userData.uuid}' RETURNING *`
    await database.runQuery("SNAPPS_DEV_DB",setPermQuery)

    // return payload
    payload.status="ok"
    payload.data=response.data[0]
    return payload
}

// grant default perms
export async function grantDefaultPerms(userData){
    // default payload
    var payload = {status:null,data:null}

    // OR the bits
    var newPerms = userData.permissions|permissions.requests
    newPerms = newPerms|permissions.asks

    // set user perms
    const setPermQuery = `UPDATE "users" SET "permissions" = '${newPerms} 'WHERE "uuid" = '${userData.uuid}' RETURNING *`
    var response = await database.runQuery("SNAPPS_DEV_DB",setPermQuery)

    // return payload
    payload.status="ok"
    payload.data=response.data[0]
    return payload
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