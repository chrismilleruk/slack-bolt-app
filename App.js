const { App, LogLevel, Logger } = require('@slack/bolt');
const blocks = require('./request-blocks');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});



// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say(`Hey there <@${message.user}>!`);
});



// Listens to incoming messages that contain "blocks"
app.command('/j5', ({ command, ack, respond }) => {
  // Acknowledge the action
  ack();
  respond({
    response_type: 'ephemeral',
    replace_original: true,
    blocks: [
    {
	    "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `Hey there <@${command.user}>!`
      },
      "accessory": {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Click Me"
        },
        "action_id": "button_click"
      }
     }
    ]
  });
});

app.action('button_click', ({ body, ack, respond, say}) => {
  // Acknowledge the action
  ack();
  say({
    text: `<@${body.user.id}> clicked the button`
  });
  respond({
    delete_original: true
  });
});




// Listens to incoming messages that contain "blocks"
app.message('request', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say({
    response_type: 'ephemeral',
    color: 'warn',
    blocks: [
      blocks.requestTitle(":raised_hand_with_fingers_splayed: Chris Miller - Deploy request", "https://google.com"),
      blocks.requestDetails("Minor Change :rocket:", "Wed, 9 Oct - 14:00-16:00 GMT",
        "Updating Prod with the following features:\n1. More functionality\n1. Fewer bugs!"),
      blocks.requestButtonsApprove('request_approve', 'req.123.approve', 'req.123.deny')
    ]
  });
});

app.action({block_id: 'request_approve'}, ({ body, action, ack, respond }) => {
  ack();

  respond({
    response_type: 'in_channel',
    replace_original: true,
    // color: 'good',
    blocks: [
      blocks.requestTitle(":tada: Chris Miller - Deploy request", "https://google.com"),
      blocks.requestDetails("Minor Change :rocket:", "Wed, 9 Oct - 14:00-16:00 GMT",
        "Updating Prod with the following features:\n1. More functionality\n1. Fewer bugs!"),
      blocks.requestApproved(`<@${body.user.id}>`, `${action.value}`)
    ]
  });
});




(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
