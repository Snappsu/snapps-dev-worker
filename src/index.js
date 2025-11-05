// -------------------------
// --- snapps.dev.worker ---
// -------------------------

// This is it, the bulk of what makes snapps.dev what it is.
// (When I'm done that is)

// This work will handle all of the internal function under the hood of snapps.dev

import { WorkerEntrypoint } from "cloudflare:workers";

import * as  messanger from "./messenger" ;

export default class extends WorkerEntrypoint
{
	async fetch() {
		await messanger.sendToDiscordWebhook("https://discord.com/api/webhooks/1435425166829293730/SWNdTKdBRvgoLbRL7ST9c09F2VXVgmnvcck8IotlfUOV9anYPIHm74AO_FxVCdvgou8B",{content:"woah"});
		return new Response('Welcome to snapps.dev!');
	}
};
