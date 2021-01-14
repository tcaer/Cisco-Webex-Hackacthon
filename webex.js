// Sending an HTTP Request from a NodeJS server

//const http = require("http");
const https = require("https");

scheduled_flights = [];


const Stream = require("stream").Transform;
const fs = require("fs");

//Schedules a flight
let ID = "N4278H  ";
let est_dep = 1609715691;

/*(async () => {
  await scheduleFlight(ID, est_dep, est_dep + 10800);
  updateFlights();
})();*/

//print out the flights that have been scheduled
for(let a = 0; a < scheduled_flights.length; a++) {
    console.log(scheduled_flights[a]);
}

// Private
function getData(ID_in, est_dep, est_arr, flight) {
  return new Promise((resolve, reject) => {

    let found = false;

    let begin =  flight.departure;
    let end = begin + 7200;

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

                // console.log(parsed[i].estDepartureAirport);

                // console.log(parsed[i].estArrivalAirport);

                flight.dep_airport = parsed[i].estDepartureAirport;

                flight.arr_airport = parsed[i].estArrivalAirport;

                // console.log(flight.dep_airport);

                // console.log(flight.arr_airport);

              resolve([true, flight]);

              break;
            }
          }

          resolve([false, null]);
      })
      .on("error", err => {
        console.log("Error: " + err.message);
        reject(err);
      });
  });
  });
}

function getHi(ID_in, est_dep, est_arr) {
  console.log("hi");
}

//Creates flight object given a flight ID and an estimated depature time in UNIX time
//Adds flight object to array of flights (scheduled flights)
async function scheduleFlight(ID_in, est_dep, est_arr, displayName) {

    let flight = {
        ID: ID_in,
        departure: est_dep,
        arrival: est_arr,
        name: displayName,
        arr_airport: "",
        dep_airport: ""

    }/*

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
      });*/

  /*getData(ID_in, est_dep, est_arr)
    .then((found) => console.log(found))
    .catch((err) => console.log(err));*/

  return new Promise((resolve, reject) => {
    getData(ID_in, est_dep, est_arr, flight)
      .then(found => {
        if (found[0]) return resolve(found[1]);
        
        reject();
      })
      .catch(err => reject(err));
  });

  //Add flight object to the array of flights
  /*if(found) {
    scheduled_flights.push(flight);
  }else {
    console.log("Flight ID: " + flight.ID + " not found");
  }*/
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

module.exports = {
  scheduleFlight,
  updateFlights,
  scheduled_flights
}
