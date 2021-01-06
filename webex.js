// Sending an HTTP Request from a NodeJS server

//const http = require("http");
const https = require("https");

scheduled_flights = [];

// console.log(Math.floor(new Date().getTime()/1000.0) );

const Stream = require("stream").Transform;
const fs = require("fs");

//Schedules a flight
let ID = "N433TM";
let est_dep = 1609715691;
scheduleFlight(ID, est_dep);

//print out the flights that have been scheduled
for(let a = 0; a < scheduled_flights.length; a++) {
    console.log(scheduled_flights[a]);
}

//Creates flight object given a flight ID and an estimated depature time in UNIX time
//Adds flight object to array of flights
function scheduleFlight(ID_in, est_dep) {

    let flight = {
        ID: ID_in,
        departure: est_dep
    }

    let found = false;

    let begin =  est_dep;
    let end = est_dep + 7200;

    //search through api for the flight
    let url = "https://opensky-network.org/api/flights/all?";

    url += ("begin=" + begin);
    url += "&";
    url += ("end=" + end);

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

  

  

/**
 * Astronomy Picture of the Day (APOD)
 * https://api.nasa.gov/planetary/apod?api_key=[Your API key here]
 * PARAMS:
 * api_key
 * hd [Boolean] default false
 * date [YYYY-MM-DD] default today
 *
 * RESPONSE:
 * copyright
 * date
 * explanation
 * title
 * hdurl
 * url
 * media_type: 'image'
 * service_version: 'v1'
 */