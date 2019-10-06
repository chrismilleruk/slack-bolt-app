
const requestTitle = (title, url) => {
  if (!!url) {
    title = `<${url}|${title}>`;
  }

  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `You have a new request:\n*${title}*`
    }
  };
};


const requestDetails = (type, when, comments) => {
  const text = `*Type:* ${type}
*When:* ${when}
*Comments:*
${comments}`;

  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": text
    },
    "accessory": {
      "type": "image",
      "image_url": "https://api.slack.com/img/blocks/bkb_template_images/approvalsNewDevice.png",
      "alt_text": "computer thumbnail"
    }
  };
};


const requestButtonsApprove = (block_id, approveValue, denyValue) => {
  return {
    "type": "actions",
    "block_id": block_id,
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "emoji": true,
          "text": "Approve"
        },
        "style": "primary",
        "value": approveValue
      },
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "emoji": true,
          "text": "Deny"
        },
        "style": "danger",
        "value": denyValue
      }
    ]
  };
}


const requestApproved = (by, when) => {
  return {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `Approved by *${by}*, ${when}.`
    }
  };
};

module.exports = {
  requestTitle,
  requestDetails,
  requestButtonsApprove,
  requestApproved
};
