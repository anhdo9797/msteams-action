import * as core from "@actions/core";
import fetch from "node-fetch";

async function main() {
	try {
		const title: string = core.getInput("TITLE", { required: true });
		const body: string = core.getInput("BODY", { required: true });
		const teamsWebhook: string = core.getInput("MS_TEAMS_WEBHOOK", { required: true });
		const mentions: string = core.getInput("MENTIONS", { required: false });
		sendTeamsNotification(title, body, teamsWebhook, mentions);
	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}


/**
 * Sends a MS Teams notification
 * @param title
 * @param body
 * @param webhookUrl
 * @param mentions
 */
async function sendTeamsNotification(title: string, body: string, webhookUrl: string, mentions?: string) {
	let messageText = body;
	let entities: any[] = [];

	if (mentions) {
		if (mentions.toLowerCase() === 'channel') {
			// Mention entire channel
			messageText = `<at>channel</at> ${body}`;
			entities.push({
				"@type": "mention",
				"text": "<at>channel</at>",
				"mentioned": {
					"id": "channel",
					"name": "channel"
				}
			});
		} else {
			// Mention specific users
			const userEmails = mentions.split(',').map(email => email.trim());
			userEmails.forEach(email => {
				messageText = `<at>${email}</at> ${messageText}`;
				entities.push({
					"@type": "mention",
					"text": `<at>${email}</at>`,
					"mentioned": {
						"id": email,
						"name": email.split('@')[0] // Use part before @ as display name
					}
				});
			});
		}
	}

	const payload = {
		"@context": "http://schema.org/extensions",
		"@type": "MessageCard",
		"title": title,
		"text": messageText,
		...(entities.length > 0 && { "entities": entities })
	};

	try {
		const response = await fetch(webhookUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});

		if (response.ok) {
			core.info("✅ Teams notification sent successfully");
		} else {
			const errorText = await response.text();
			core.error(`❌ Failed to send Teams notification: ${response.status} ${errorText}`);
			core.setFailed(`Teams API returned ${response.status}`);
		}
	} catch (error) {
		core.error(`❌ Failed to send Teams notification: ${error.message}`);
		core.setFailed(error.message);
	}
}

main();
