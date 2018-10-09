const express = require("express");
const fetch = require("node-fetch");
const { slackApi } = require("./controllers/slack");
const { user } = require("./database");
const config = require("./config");

const app = express();
app.use(express.json());

/**
 * Start listening
 */
app.listen(config.port, () => {
  console.log(`Listening on port ${config.port}`);
});

/**
 * Healthcheck route
 */
app.get("/", (req, res) => {
  res.send("Hello world!");
});

/**
 * OAuth callback
 */
app.get("/oauth/callback", async (req, res) => {
  if (!req.query.code) {
    res.status(500);
    res.send({ Error: "Missing code." });
    return;
  }

  // Could use a library to properly encode and format the query here
  const url = `https://slack.com/api/oauth.access?code=${
    req.query.code
  }&client_id=${config.clientId}&client_secret=${config.clientSecret}`;
  const response = await fetch(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(response.error);
  }
  // Here we should save the access token to the database
  return res.json(response);
});

/**
 * Route hit when the user enter the command /birthday
 */
app.post("/birthday", async (req, res) => {
  await slackApi("chat.postMessage", {
    token: user.accessToken,
    channel: "general",
    as_user: false,
    text: "When is your birthday?"
  });
  await slackApi("chat.postMessage", {
    token: user.accessToken,
    channel: "general",
    as_user: false,
    text: "Now...",
    attachments: [
      {
        fallback: "Try again",
        text: "Chose a date",
        callback_id: "choseDate",
        mrkdwn_in: ["fields"],
        fields: [
          {
            title: "Date",
            value: `<!date^${parseInt(
              Date.now() / 1000,
              10
            )}^{date_long} at {time}|${new Date().toGMTString()}>`,
            short: true
          }
        ]
      }
    ]
  });
  res.send();
});

/**
 * Route hit by the webhook on the team_join event
 */
app.post("/join", async (req, res) => {
  const {
    body: { challenge, event }
  } = req;
  // Webhook check route
  if (challenge) {
    return res.json({ challenge });
  }

  // Send a message via the Slackbot channel to welcome a new member
  await slackApi("chat.postMessage", {
    token: user.accessToken,
    channel: user.userId,
    as_user: false,
    text: "Welcome to the team!"
  });
  res.send();
});
