// -------------------------
// --- snapps.dev.worker ---
// -------------------------

// This is it, the bulk of what makes snapps.dev what it is.
// (When I'm done that is)

// This work will handle all of the internal function under the hood of snapps.dev

// Unfortunately, I have to manually insert each command because I have them in their own files

import { WorkerEntrypoint } from "cloudflare:workers";
import * as  messages from "./messenger";
import * as  users from "./users";
export default class extends WorkerEntrypoint
{
	// ===== messenger commands =====

	async sendToDiscordWebhook(webhookURL, messageObject, silent=false, embeds=false){
		return messages.sendToDiscordWebhook(webhookURL, messageObject, silent=false, embeds=false)
	}

	// ===== user commands =====

	// user lookup
	async getUserByDiscordUsername(discordUsername) {
		return users.getUserByDiscordUsername(discordUsername)
	}
	async getUserByDiscordID(discordID) {
		return users.getUserByDiscordID(discordID)
	}
	async getUserByUUID(uuid) {
		return users.getUserByUUID(uuid)
	}
	async listUsers(sort="iat",limit=25,page=1) {
		return users.listUsers(sort="iat",limit=25,page=1) 
	}

	// user registration
	async createUserViaDiscordExternal(discordAuthorizationToken,redirect_uri) {
		return users.createUserViaDiscordExternal(discordAuthorizationToken,redirect_uri) 
	}
	async createUserViaDiscordInternal(discordUserData) {
		return users.createUserViaDiscordInternal(discordUserData) 
	}

	// user modification
	async upateUserViaDiscordServer(userData) {
		return users.upateUserViaDiscordServer(userData) 
	}
	async addFlags(userData,flagBits) {
		return users.addFlags(userData,flagBits)
	}
	async removeFlags(userData,flagBits) {
		return users.removeFlags(userData,flagBits) 
	}
	async setFlags(userData,flagBits) {
		return users.setFlags(userData,flagBits)
	}
	async addPerms(userData,permBits) {
		return users.addPerms(userData,permBits)
	}
	async removePerms(userData,permBits) {
		return users.removePerms(userData,permBits)
	}
	async setPerms(userData,permBits) {
		return users.setPerms(userData,permBits)
	}
	async grantDefaultPerms(userData) {
		return users.grantDefaultPerms(userData)
	}
	
	
	// user flags + perms
	isVerified(userData) {
		return users.isVerified(userData)
	}
	isBanned(userData) {
		return users.isBanned(userData)
	}
	isPrivate(userData) {
		return users.isPrivate(userData)
	}
	isKinky(userData) {
		return users.isKinky(userData) 
	}
	canMakeRequests(userData) {
		return users.canMakeRequests(userData) 
	}
	canMakeAsks(userData) {
		return users.canMakeAsks(userData) 
	}

	// user misc info
	getUserAvatarURL(userData) {
		return users.getUserAvatarURL(userData) 
	}
	getUserDiscordMention(userData) {
		return users.mentionUserDiscord(userData)
	}

};
