require('dotenv').config();

const { App } = require('@slack/bolt');
const reviewApp = require("./review/info"); 

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SOCKET_TOKEN,
  socketMode: true,
  logLevel: 'debug',
});

app.message(/^test$/, async ({ message, say, client }) => {
  if (message.thread_ts === undefined) {
    const gasButton = {
      blocks: [
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Reimburse me!',
              },
              action_id: "review_button", 
              style: 'primary',
            },
          ],
        },
      ],
      thread_ts: message.ts,
    };

    await say(gasButton);

    try {
      await client.reactions.add({
        token: process.env.SLACK_BOT_TOKEN,
        name: 'fuelpump',
        channel: message.channel,
        timestamp: message.ts,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }
});

app.action('review_button', reviewApp.handleInfoButton); 

app.view('modal', reviewApp.handleInfoButton);

app.message(/^review$/, async ({ message, say }) => {
  await say({
    text: "Your application has been submitted! We'll review it and post in this thread within 24 hours.",
    thread_ts: message.ts,
  });
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
