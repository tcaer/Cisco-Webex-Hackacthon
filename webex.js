// Sending an HTTP Request from a NodeJS server

//const http = require("http");
const https = require("https");

scheduled_flights = [];

// console.log(Math.floor(new Date().getTime()/1000.0) );

const Stream = require("stream").Transform;
const fs = require("fs");




findFlightByIDandTime("N433TM  ", 1609715691);




  function findFlightByIDandTime(ID, est_dep) {

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
          //console.log(data.substring(0, 200));
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          let parsed = JSON.parse(data);
          // console.log(parsed.length);
          
          //loop through the list of api flights, search for the flight ID

          for (let i = 0; i < parsed.length; i++) {
            if (parsed[i].callsign == ID) {
              console.log(parsed[i].firstSeen);
            }
          }

      })
      .on("error", err => {
        console.log("Error: " + err.message);
      });

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