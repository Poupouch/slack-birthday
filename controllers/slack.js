const fetch = require("node-fetch");
const querystring = require("querystring");

/**
 * Convenience wrapper around the Slack API
 * @public
 * @param {String} path The Slack API path to call, eg. chat.postMessage.
 * @param {String} body The JSON payload to send as the POST body.
 * @returns {Object} The Slack JSON response.
 */
async function slackApi(path, body) {
  const response = await fetch(`https://slack.com/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: querystring.stringify(body)
  });
  const jsonResponse = await response.json();
  if (!jsonResponse.ok) {
    console.error(jsonResponse);
    throw new Error(jsonResponse.error);
  }
  return jsonResponse;
}

module.exports = { slackApi };
