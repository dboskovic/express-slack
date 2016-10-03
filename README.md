# Slack Express Middleware

### Example
```js
const {PORT, SCOPE, TOKEN, CLIENT_ID, CLIENT_SECRET} = process.env,
      slack = require('express-slack'),
      express = require('express'),      
      app = express();

app.use('/slack', slack({
  scope: SCOPE,
  token: TOKEN,
  store: 'data.json'
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET
}));

// handle the "/test" slash commands
slack.on('/test', (msg, bot) => {
  bot.reply('works!');
});

app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
```

### Other Event Examples
```js
// handle RTM messages
slack.on('message', (msg, bot) => { });

// handle all slash commands
slack.on('slash_commands', (msg, bot) => { });

// handle the outgoing webhooks trigger word "googlebot"
slack.on('googlebot', (msg, bot) => { });

// handle multiple events
slack.on('googlebot', '/test', 'slash_commands', (msg, bot) => { });

// wildcard support
slack.on('*', (msg, bot) => { });
```
