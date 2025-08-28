import * as core from "@actions/core";
import request from "request";

interface Mention {
    id: string; // Đối với user, đây là email (UPN) của họ
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
    let processedBody = body;

    if (mentionsInput && mentionsInput.length > 0) {
        try {
            mentions = JSON.parse(mentionsInput);

            const mentionTexts = mentions.map(mention => `<at>${mention.name}</at>`);
            if (mentionTexts.length > 0) {
                processedBody += '<br><br>' + mentionTexts.join(' ');
            }
        } catch (e) {
            core.warning(`⚠️ Failed to parse MENTIONS input. It was not a valid JSON: ${e.message}`);
        }
    }

    const payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": title,
        "title": title,
        "text": processedBody,
        "potentialAction": [],
        "mentions": mentions.map(m => ({
            "type": "mention",
            "text": `<at>${m.name}</at>`,
            "mentioned": {
                "id": m.id,
                "name": m.name
            }
        }))
    };
    
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