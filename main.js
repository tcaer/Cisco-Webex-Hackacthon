require("dotenv").config();
let Framework = require("webex-node-bot-framework");
let webhook = require("webex-node-bot-framework/webhook");

let express = require("express");
let bodyParser = require("body-parser");
let path = require('path');
let fs = require("fs");

const cardBody = JSON.parse(fs.readFileSync(path.join(__dirname, "/config/flightcard.json")));

// The server that will accept webhooks and host the calendar
var expressApp = express();

// Allow the usage of ?= url params and json bodies
expressApp.use(bodyParser.urlencoded({extended: true}));
expressApp.use(bodyParser.json());

const config = {
  webhookUrl: process.env.BOT_WEBHOOK,
  token: process.env.BOT_ACCESS_TOKEN,
  port: process.env.PORT || 8080 // Server runs at :8080
};

var framework = new Framework(config);
framework.start();

framework.on("initialized", function () {
  framework.debug("Framework initialized successfully! [Press CTRL-C to quit]");
});

framework.on('spawn', function (bot, id, addedBy) {
  if (!addedBy) {
    // don't say anything here or your bot's spaces will get 
    // spammed every time your server is restarted
    framework.debug(`Framework created an object for an existing bot in a space called: ${bot.room.title}`);
  } else {
    // addedBy is the ID of the user who just added our bot to a new space, 
    // Say hello, and tell users what you do!
    bot.say('Hi there, you can say hello to me.  Don\'t forget you need to mention me in a group space!');
  }
});

framework.hears('hello', function(bot, trigger) {
  bot.say('Hello %s!', trigger.person.displayName);
  responded = true;
});


expressApp.use(express.static('public'));
expressApp.set('view engine', 'ejs');

framework.hears("schedule", function(bot, trigger) {
  bot.sendCard({
    attachments: cardBody
  });
});

framework.on('attachmentAction', function (bot, trigger) {
  bot.say(`Got an attachmentAction:\n${JSON.stringify(trigger.attachmentAction, null, 2)}`);
});

/* Server stuff */
expressApp.post("/webhook", webhook(framework));

expressApp.get('/', (req, res) => res.send('Hello'));

// localhost:8080/calendar, http://whatever.com/calendar
var user = "bob";

expressApp.get('/calendar', (req, res) => {
  //static calendr without flight data
  // res.sendFile(path.join(__dirname, '/views/calendar.html'));

  res.render('calendar', { username: user });

});

var server = expressApp.listen(config.port, function() {
  framework.debug(`Framework listening on port ${config.port}`);
});

function exitHandler() {
  framework.debug("Stopping...");
  server.close();

  framework.stop().then(function() {
    process.exit();
  });
}

process.on("SIGINT", exitHandler);
process.on("exit", exitHandler);
