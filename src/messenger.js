import { WorkerEntrypoint } from "cloudflare:workers";
import { env } from "cloudflare:workers";
export default class extends WorkerEntrypoint {

}


// This worker is the "Postal Service" of snapps.dev
// The SDPS for short
// To be used for quick logging and notifications

// -------------
// --- Email ---
// -------------

// Send to email address
export async function sendToEmail(){}

// ---------------
// --- Discord ---
// ---------------
// This requires having a discord application (which will go goodest_bold in my case)
// Users would also have to consent beforehand I assume...
// nbd

// Send to DM
export async function sendToDiscordDM(userID){}

// Send to Server
export async function sendToDiscordServer(guildID,channelID){}

// Send to Webhook
export async function sendToDiscordWebhook(webhookURL, messageObject, silent=false, embeds=false){
	console.log("sending message to discord webhook...")
	messageObject.username  = "snapps.dev delivery service"
	messageObject.avatar_url = "https://cdn.snapps.dev/fastest-kobold-icon.gif"
	var flags = 0;
	if (silent) flags += 2**12 
	if (embeds) flags += 2**2
	if (flags != 0) messageObject.flags = flags;
	const options = {
	method: 'POST',
	headers: {'Content-Type': 'application/json',},
	body: JSON.stringify(messageObject)};
	await fetch(webhookURL, options)
	.then(response => {console.log("message sent!")})
	.catch(err => {console.log("something went wrong!");console.error(err)});
}

// -------------------
// --- FurAffinity ---
// -------------------

// Post to journal
// Send to user

// ---------------
// --- Bluesky ---
// ---------------

// Post to account
// Send to DM

// ---------------
// --- Twitter ---
// ---------------

// Post to account
// Send to DM

// -------------
// --- Itaku ---
// -------------

// Post to account
