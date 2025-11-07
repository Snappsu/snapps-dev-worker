import { env } from "cloudflare:workers";
import * as  users from "./users";
import * as  messanger from "./messenger" ;
import * as database from "./database"

// create request
export async function createRequest(requestData) {

    // default payloads
    var payload = {status:null,data:null}

    var user = await (await users.getUserByUUID(requestData.owner)).data
    
    // check if user is banned
    if (users.isBanned(user)) {
        payload.status = "error"
        payload.data = "user is banned"
        return payload
    }
        
    // check if user is verified
    if (!users.isVerified(user)) {
        payload.status = "error"
        payload.data = "user not verified"
        return payload
    }
    
    // check if user has request permission
    if (!users.canMakeRequests(user)) {
        payload.status = "error"
        payload.data = "user not allowed to make requests"
        return payload
    }

    // requestData should include...
    // - UUID of requests owner
    // - details of the request
    // - wether the request is (0) public, (1) anonymous, or (2) private
    // - attached reference images
    
    // constuct the request
    var request = {
        owner:requestData.owner,
        details: requestData.details,
        publicity: requestData.publicity,
        handles: []
    }

    // set UUID
    request.id = crypto.randomUUID()
    // set IAT
    request.iat = Date.now()
    // set status to 0
    request.stats = 0

    // add request to Request DB
    const query = `INSERT INTO "main"."requests" ("id", "owner", "details", "has_references", "publicity", "handles", "iat", "status", "finish_time", "finish_product") VALUES('${request.id}', '${request.owner}', '${request.details}', 0, ${request.publicity}, '${JSON.stringify(request.handles)}', ${request.iat}, ${request.stats}, ${null},  ${null}) RETURNING rowid, *`
    // upload images to Request /reference Bucket`
    const result = await database.runQuery("SNAPPS_DEV_DB",query)

    //constuct payload
    payload.data=request
    payload.status = "ok"

    // notify me that a request has been made
    await messanger.sendToDiscordWebhook(env.DISCORD_WEBHOOK_TEST_CHAT,{content:`You got a new request!\n\`\`\`json\n${JSON.stringify(request)}\`\`\``});
    
    // return payload
    return payload
}

// get users requests
export async function getUsersRequests(userID, filter) {
    // default payload
    var payload = {status:null,data:null}

    // filter which requests to get
    var userRequests = [];

    switch (filter) {
        case "alive":
            
            break;
        case "expired":
            
            break;
        case "all":
            
            break;   
        default: // no filter 
            // assume alive
            break;
    }

    // add requests to payload
    payload.data = userRequests

    // return payload
    return payload
}

// get requests
export async function getRequest(requestID, userID) {
    // default payload
    var payload = {status:null,data:null}

    // get request from Request DB
    // use userID to check if user has access to private request

    // return payload
    return payload
}


// edit request
export async function editRequest(userID,requestID) {
    // default payload
    var payload = {status:null,data:null}

    // return payload
    return payload
}

// delete requests
export async function deleteRequest(requestID) {
    // default payload
    var payload = {status:null,data:null}

    // return payload
    return payload
}

// complete requests
export async function completeRequest(requestID,imageData) {
    // default payload
    var payload = {status:null,data:null}

    // return payload
    return payload
}
