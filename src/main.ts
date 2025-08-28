import * as core from "@actions/core";
import request from "request";

interface Mention {
	id: string;  
	name: string;
}

async function main() {
	try {
		const title: string = core.getInput("TITLE", { required: true });
		const body: string = core.getInput("BODY", { required: true });
		const teamsWebhook: string = core.getInput("MS_TEAMS_WEBHOOK", { required: true });
		const mentionsInput: string = core.getInput("MENTIONS", { required: false });

		await sendTeamsNotification(title, body, teamsWebhook, mentionsInput);

	} catch (err) {
		core.error("❌ Failed");
		core.setFailed(err.message);
	}
}


/**
 * Sends a MS Teams notification with mentions
 * @param title
 * @param body
 * @param webhookUrl
 * @param mentionsInput - A JSON string of the mentions array
 */
async function sendTeamsNotification(title: string, body: string, webhookUrl: string, mentionsInput: string) {
	let mentions: Mention[] = [];

	if (mentionsInput && mentionsInput.length > 0) {
		try {
			mentions = JSON.parse(mentionsInput);
			core.info(`✅ Parsed ${mentions.length} mentions successfully`);
		} catch (e) {
			core.warning(`⚠️ Failed to parse MENTIONS input. It was not a valid JSON: ${e.message}`);
		}
	}

	const getTags = () => {
		return mentions.map((mention) => {
			return `<at>${mention.name}</at>`;
		}).join(", ");
	};

	const getEntities = () => {
		return mentions.map((mention) => {
			return {
				"type": "mention",
				"text": `<at>${mention.name}</at>`,
				"mentioned": {
					"id": mention.id,
					"name": mention.name
				}
			};
		});
	};

	// Build payload with mentions
	const payload = {
		"type": "message",
		"attachments": [{
			"contentType": "application/vnd.microsoft.card.adaptive",
			"content": {
				"type": "MessageCard",
				"body": [
					{
						"type": "TextBlock",
						"size": "Medium",
						"weight": "Bolder",
						"text": title
					},
					{
						"type": "TextBlock",
						"text": body,
						"wrap": true
					},
					{
						"type": "TextBlock",
						"text": getTags()
					}
				],
				"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
				"version": "1.0",
				"msteams": {
					"width": "Full",
					"entities": getEntities()
				}
			}
		}]
	};

	// Log payload for debugging
	core.info('📤 Sending payload to Teams webhook');
	core.debug(`Payload: ${JSON.stringify(payload, null, 2)}`);

	request(webhookUrl, {
		method: "POST",
		body: JSON.stringify(payload),
		headers: { 'Content-Type': 'application/json' }
	}, (error, response, body) => {
		if (error) {
			core.setFailed(`Request failed: ${error}`);
		} else if (response.statusCode >= 400) {
			core.setFailed(`Failed to send notification. Status: ${response.statusCode}. Body: ${body}`);
		} else {
			core.info('✅ Notification sent successfully!');
		}
	});
}

main();