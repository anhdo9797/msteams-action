## Microsoft Teams Action

This action allows a message to be sent to a Microsoft Teams webhook with support for user mentions.

Instructions for creating a MS Teams webhook can be found here:
https://docs.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/connectors-using

## Parameters

- `TITLE` (required): The title of the message
- `BODY` (required): The body content of the message  
- `MS_TEAMS_WEBHOOK` (required): The Microsoft Teams webhook URL
- `MENTIONS` (optional): JSON array of users to mention in the message. Each user object should have:
  - `id`: User's email (UPN)
  - `name`: User's display name

## Example with mentions
```yaml
- uses: anhdo9797/msteams-action@master
  with:
    TITLE: "Deployment Notification"
    BODY: "🚀 New deployment completed successfully!"
    MS_TEAMS_WEBHOOK: ${{ secrets.TEAMS_WEBHOOK }}
    MENTIONS: |
      [
        {
          "id": "developer@company.com",
          "name": "Developer Name"
        },
        {
          "id": "manager@company.com",
          "name": "Manager Name"
        }
      ]
```
OR
```yaml
- uses: anhdo9797/msteams-action@master
  with:
    TITLE: "Deployment Notification"
    BODY: "🚀 New deployment completed successfully!"
    MS_TEAMS_WEBHOOK: ${{ secrets.TEAMS_WEBHOOK }}
    MENTIONS: ${{ secrets.MENTIONS }}
```

 
