import { env } from "cloudflare:workers";
import * as  messanger from "./messenger" ;

// create request
export async function createRequest(requestData) {

    // default payload
    var payload = {status:null,data:null}


    // check if user is verified
    // check if user has request permission

    // requestData should include...
    // - UUID of requests owner
    // - details of the request
    // - wether the request is (0) public, (1) anonymous, or (2) private
    // - attached reference images

    // set UUID
    // set IAT
    // set status to 0

    // add request to Request DB
    // upload images to Request /reference Bucket

    // notify me that a request has been made
    await messanger.sendToDiscordWebhook();
    
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
