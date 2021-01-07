// Sending an HTTP Request from a NodeJS server

//const http = require("http");
const https = require("https");

scheduled_flights = [];

// console.log(Math.floor(new Date().getTime()/1000.0) );

const Stream = require("stream").Transform;
const fs = require("fs");

//Schedules a flight
let ID = "N4278H  ";
let est_dep = 1609715691;
scheduleFlight(ID, est_dep, est_dep + 10800);
updateFlights();

//print out the flights that have been scheduled
for(let a = 0; a < scheduled_flights.length; a++) {
    console.log(scheduled_flights[a]);
}

//Creates flight object given a flight ID and an estimated depature time in UNIX time
//Adds flight object to array of flights (scheduled flights)
function scheduleFlight(ID_in, est_dep, est_arr) {

    let flight = {
        ID: ID_in,
        departure: est_dep,
        arrival: est_arr
    }

    let found = false;

    let begin =  est_dep;
    let end = est_dep + 7200;

    //search through api for the flight
    let url = "https://opensky-network.org/api/flights/all?";

    url += ("begin=" + begin);
    url += "&";
    url += ("end=" + end);

    console.log(url);
    
    https
      .get(url, resp => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", chunk => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          let parsed = JSON.parse(data);
          
          //loop through the list of api flights, search for the flight ID
          for (let i = 0; i < parsed.length; i++) {
            if (parsed[i].callsign == ID) {
              found = true;

              console.log("found");
              break;
            }
          }

      })
      .on("error", err => {
        console.log("Error: " + err.message);
      });

      //Add flight object to the array of flights
      if(found) {
        scheduled_flights.push(flight);
      }else {
        console.log("Flight ID: " + flight.ID + " not found");
      }
  })
}

//after adding flights, everytime user wants to see schedule, update is called
//makes sure that all flight times are "live"

function updateFlights() {

  console.log(scheduled_flights.length);

  for (let i = 0; i < scheduled_flights.length; i++) {

    let found = false;

    let url = "https://opensky-network.org/api/flights/all?";

    url += ("begin=" + scheduled_flights[i].departure);
    url += "&";
    url += ("end=" + scheduled_flights[i].arrival);


    https
      .get(url, resp => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", chunk => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          let parsed = JSON.parse(data);
          
          //loop through the list of api flights, search for the flight ID

          for (let i = 0; i < parsed.length; i++) {
            if (parsed[i].callsign == scheduled_flights[i].ID) {
              found = true;

              scheduled_flights[i].arrival = parsed[i].firstSeen;
              scheduled_flights[i].departure = parsed[i].lastSeen;

              break;
            }
          }

          if (!found) {
            scheduled_flights.splice(i, 1);
            //item not there, remove it from schedule
            //handles case where flight is missing

          }

      })
      .on("error", err => {
        console.log("Error: " + err.message);
      });

      //Add flight object to the array of flights
  })

    



  }

  
}


