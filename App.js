const { App, LogLevel, Logger } = require('@slack/bolt');
const blocks = require('./request-blocks');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
});

const REQUEST_CHANNEL = 'CNXKENXC0';

// set up /j5 commands
require('./slash-command').register(app);


// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  say(`Hey there <@${message.user}>!`);
});




// Listens to incoming messages that contain "request"
app.message('test request', ({ message, say }) => {
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


app.message('start deploy', async ({ message, context, say}) => {
  try {
    console.log(context);
    console.log(message);

    // Call the chat.scheduleMessage method with a token
    const result = await app.client.chat.postMessage({
      // The token you used to initialize your app is stored in the `context` object
      token: context.botToken,
      channel: REQUEST_CHANNEL,
      text: ":raised_hand_with_fingers_splayed: Chris Miller - Deploy request",

      blocks: [
        blocks.requestTitle(":raised_hand_with_fingers_splayed: Chris Miller - Deploy request", "https://google.com"),
        blocks.requestDetails("Minor Change :rocket:", "Wed, 9 Oct - 14:00-16:00 GMT",
          "Updating Prod with the following features:\n1. More functionality\n1. Fewer bugs!"),
        blocks.requestButtonsApprove('request_approve', 'req.123.approve', 'req.123.deny')
      ]
    });

    say(`Hey there <@${message.user}>! I've made the deploy request for you.`);

  }
  catch (error) {
    console.error(error);
  }
});




(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
