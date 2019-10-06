const { directMention } = require('@slack/bolt');

var natural = require('natural');
var Analyzer = require('natural').SentimentAnalyzer;
var stemmer = require('natural').PorterStemmer;
var analyzer = new Analyzer("English", stemmer, "afinn");


function wordBlocks(tokens) {
  let words = tokens.map((word) => `*${word}*`).join(' - ');

  return [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `${words}`
    }
  }];
}

function sentimentBlock(tokens) {
  let sentiment = analyzer.getSentiment(tokens);

  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `Sentiment: ${sentiment}`
    }
  }
}

function parseCommand(payload) {
  /*
  commandPayload: {
    token: 'Q3rz7QsMjByn5cocYordeetx',
    team_id: 'TNX5L0PRS',
    team_domain: 'hsbc-slackbots',
    channel_id: 'DP32MKCVB',
    channel_name: 'directmessage',
    user_id: 'UNJRTUD3L',
    user_name: 'chrismilleruk',
    command: '/j5',
    text: '',
    response_url: 'https://hooks.slack.com/commands/TNX5L0PRS/785462390469/rNlVeJkC1ffxRhFd39NkAzy8',
    trigger_id: '784993177268.779190023876.52ba3e5bb7274dd97d9cc133eb1c9568'
  }
  */
  var tokenizer = new natural.TreebankWordTokenizer();
  const tokens = tokenizer.tokenize(payload.text.replace("’", "'"));

  console.log(payload);
  console.log(tokens);

  return [
    ...wordBlocks(tokens),
    sentimentBlock(tokens)
  ];
}

const messageHandler = ({ payload, event, respond, say }) => {
  const blocks = parseCommand(payload);

  let response = {
    response_type: 'ephemeral',
    replace_original: true,
    blocks: [
      {
  	    "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${payload.user}>!\nI understood the following terms:`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Cancel"
          },
          "action_id": "j5_confirm_button_click"
        }
      }, ...blocks
    ]
  }

  if (!respond) {
    say(response);
  } else {
    respond(response);
  }
};

// { command, ack, respond }
const slashHandler = (args) => {
  // Acknowledge the action
  args.ack();

  messageHandler(args);
};

const directMentionHandler = (args) => {
  let { payload } = args;

  // Remove the botname from the start of the text.
  // https://github.com/slackapi/bolt/blob/b030f274/src/middleware/builtin.ts#L305
  const slackLink = /<(?<type>[@#!])?(?<link>[^>|]+)(?:\|(?<label>[^>]+))?>/g;

  const text = payload.text.trim();
  const matches = slackLink.exec(text);

  // let words = args.payload.text.split(slackLink);
  payload.command = payload.text.match(slackLink).groups;
  payload.text = payload.text.replace(slackLink, (match, p1, p2) => p2);

  messageHandler(args);
}




const cancelButtonClickHandler = ({ body, ack, respond, say}) => {
  // Acknowledge the action
  ack();

  // Delete the ephemeral message
  respond({
    delete_original: true
  });
};

const confirmButtonClickHandler = ({ body, ack, respond, say}) => {
  // Acknowledge the action
  ack();

  say({
    text: `<@${body.user.id}> clicked the confirm button`
  });
  respond({
    response_type: 'in_channel',
    replace_original: true,
    text: `You clicked the confirm button`
  });
};




module.exports = {
  register: (app) => {
    // Slash Command = /j5 send requests here
    app.command('/j5', slashHandler);

    // channel mentions = @Johnny5 send requests here
    app.event('app_mention', directMentionHandler);
    // app.message(directMention(), directMentionHandler);

    // Direct messsage = [in @Johnny5 channel] send requests here
    // app.message({"channel_type": "im"}, messageHandler);

    app.action('j5_cancel_button_click', cancelButtonClickHandler);
    app.action('j5_confirm_button_click', confirmButtonClickHandler);
  }
};
