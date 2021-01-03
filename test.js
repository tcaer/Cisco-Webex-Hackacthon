// Sending an HTTP Request from a NodeJS server

//const http = require("http");
const https = require("https");

const Stream = require("stream").Transform;
const fs = require("fs");

findFlightByID("BTQ384  ");
  function findFlightByID(ID) {

    //search through api for the flight
    https
      .get("https://opensky-network.org/api/states/all", resp => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", chunk => {
          data += chunk;
          //console.log(data.substring(0, 200));
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          let parsed = JSON.parse(data);
          let states = parsed.states;
          //loop through the list of api flights, search for the flight ID
          let found = false;
          for(let a = 0; a < states.length; a++) {
            if(states[a][1] === ID) {
              //add to some data structure
              console.log("Flight ID: " + ID + "found.");
              found = true;
            }
          }
          if(!found) {
            console.log("Flight ID: " + ID + " not found.");
          }
        });

      })
      .on("error", err => {
        console.log("Error: " + err.message);
      });
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