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
	async fetch(request, env, ctx) {
		// === Test Area ===

		// =================
		return new Response("welcome to snapps.dev");
	}
};
