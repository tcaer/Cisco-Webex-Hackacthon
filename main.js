require("dotenv").config();
let Framework = require("webex-node-bot-framework");
let webhook = require("webex-node-bot-framework/webhook");

let express = require("express");
let bodyParser = require("body-parser");
let path = require("path");
let fs = require("fs");

let opensky = require("./webex");




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
  bot.say(
    "markdown", 
    `Submit a new flight [here](https://shrouded-dusk-67323.herokuapp.com/newflight?name=${trigger.person.displayName})`
  );
});


/* Server stuff */
expressApp.post("/webhook", webhook(framework));

expressApp.get('/', (req, res) => res.send('Hello'));

expressApp.get("/newflight", (req, res) => {
  let { spaceId, displayName } = req.query;

  res.render("form", { spaceId, displayName });
});

expressApp.post("/submit", async (req, res) => {
  // console.log(req.body);

  let { departure, arrival, flightnumber, spaceId } = req.body;

  // console.log(typeof departure);

  let departure_unix = new Date(departure).getTime()/1000; // use .getTime() to get the date in milliseconds since 1970
  let arrival_unix = new Date(arrival).getTime()/1000; // use .getTime() to get the date in milliseconds since 1970

  // console.log(flightnumber);

  let l = flightnumber.length;

  for (let i = l; i < 8; i++) {
    flightnumber += " ";
  }

  // console.log(opensky.scheduled_flights.length);

  await opensky.scheduleFlight(flightnumber, departure_unix, arrival_unix);

  // console.log(opensky.scheduled_flights.length);

  // console.log(opensky.scheduled_flights[0].arrival);

  // console.log(flightnumber.length);

  let events = [];

  let color = ['blue', 'red', 'green'];

  for (let i = 0; i < opensky.scheduled_flights.length; i++) {
    
    
    let event_template = {
      id: '2',
      calendarId: '1',
      title: 'yo',
      category: 'time',
      dueDateClass: '',
      start: '2021-01-21T17:30:00+09:00',
      end: '2021-01-22T17:31:00+09:00',
      isReadOnly: true,   // schedule is read-only
      bgColor: 'red'
    }

    event_template.start = new Date(opensky.scheduled_flights[i].departure * 1000).toISOString();

    event_template.end = new Date(opensky.scheduled_flights[i].arrival * 1000).toISOString();

    event_template.title = "Example Name";

    // event_template.bgColor = color[getRandomInt(color.length)];


    events.push(event_template);

  }

  // let event = [
        
  //   {
  //       id: '2',
  //       calendarId: '1',
  //       title: 'yo',
  //       category: 'time',
  //       dueDateClass: '',
  //       start: '2021-01-21T17:30:00+09:00',
  //       end: '2021-01-22T17:31:00+09:00',
  //       isReadOnly: true    // schedule is read-only
  //   },

  //   {
  //   id: '1',
  //   calendarId: '2',
  //   title: 'second schedule',
  //   category: 'time',
  //   dueDateClass: '',
  //   start: '2021-01-14T17:30:00+09:00',
  //   end: '2021-01-15T17:31:00+09:00',
  //   isReadOnly: true
  // }





let event_string = JSON.stringify(events);

console.log(event_string);



  // opensky.scheduled_flights()

  //trim string call sign to be certain number of characters, convert every flight json into a json array of "events" with ISO times, 
  //stringify this json array, and use calendar.ejs 
  //to populate calendar

//   

// console.log(opensky.scheduled_flights.length);

  // Record the information

  //instead of sending blank html file with this response
  // res.send("Your data has been recorded! You may now close this tab");

  //send calendar


  res.render('calendar', { event: event_string });
});

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
