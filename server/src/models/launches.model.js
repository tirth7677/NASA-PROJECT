// launches and planets contain my models
const axios = require("axios");
const launches = require("./launches.mongo");
const planets = require("./Planets.mongo");
const DEFAULT_FLIGHT_NUMBER = 1;
// const launch = {
//   flightNumber: 1, //exist in spacex api as flight_number
//   mission: "Kepler Exploration X", //exist in spacex api as name
//   rocket: "Explorer isi", //exist in spacex api as rocket.name
//   launchDate: new Date("December 27, 2030"), //exist in spacex api as data_local
//   target: "Kepler-442 b", //not applicable
//   customers: ["Nasa", "Tirth"], ////exist in spacex api as payloads.customer
//   upcoming: true, //exist in spacex api as upcoming
//   success: true, //exist in spacex api as success
// };
// //here i save this launch which is default
// saveLaunch(launch);

// to load data from spacex
const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Downloading lauch data...");
  //first argument is url and second agrument is request body
  // query is empty so there is not any specific query options mean additional query and we need to populate the data in rocket "path" mean that rocket path and from rocket we have to select name which is 1 mean i only need name field from rocket
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      // here pagination is false that mean we can see all that data not limited to pages
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  //spacex api might get some other response code so we can write this to ensure it give correct code
  if (response.status !== 200) {
    console.error("Problem Downloding launch");
    throw new Error("Launch Data Download Failed");
  }

  //here i have store my result in launchdate response. data which is axios property and docs is we see in spacex api in which all data is store
  const launchDocs = response.data.docs;
  //apply for loop to enter each data in the launch array
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    // bascially flatmap is convert multiple array into one array
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(`${launch.flightNumber} ${launch.mission}`);
    // here finally upload all this data in our mongodb collection so everytime we don't have to do spacex request
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  // this findLaunch will make sure that our data is come from spacex api
  // why do we do this because we don't have to make every time this long request so i can save it in my database and then i can check that everytime my database has that same value as the spacex api
  const firstlaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstlaunch) {
    console.log("Launch data already exist");
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

//here i have checked wheather my launch id is match with my mongo database flightnumber
async function existedlaunchwithID(launchID) {
  return await findLaunch({
    flightNumber: launchID,
  });
}

// i have recieved latestflight number
async function getLatestFlightNumber() {
  // The .sort('-flightNumber') part of the code is sorting the result in descending order based on the flightNumber field. So, if you have flight numbers 1, 2, 3, 4, 5, the sorted result will be 5, 4, 3, 2, 1. This is because the minus sign (-) before the field name indicates a descending sort order.
  const latestlaunch = await launches.findOne().sort("-flightNumber");
  if (!latestlaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestlaunch.flightNumber;
}

//  if you use .find() without any conditions, it will return all documents from the MongoDB collection specified by the Mongoose model (launches in this case). The find() method without any arguments retrieves all documents in the collection.
async function getAllLaunches(skip, limit) {
  // {} (Empty Query): The first argument to .find() is the query criteria. An empty object {} as the first argument means there are no specific criteria, and it will match all documents in the collection.
  // The second argument is the projection. In MongoDB, a projection specifies which fields to include or exclude in the returned documents.
  // {'_id': 0, '__v': 0} means excluding the _id and __v fields from the returned documents. The _id field is typically included by default, but in this case, it's explicitly excluded with _id: 0. The __v field is often added by Mongoose for versioning but is commonly excluded from query results.
  // .sort if for acesdening order of the flightnumber
  return await launches
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

//here i have to savelaunches
//here in parameter launch is used mean user give me all the data that is in launch
async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    {
      // this is the criteria which document i have to update
      flightNumber: launch.flightNumber,
    },
    //launch: This is the document that will be used to update the matched document. In this case, it's using the entire launch object as the update.
    launch,
    //{ upsert: true }: This option stands for "upsert," which is a combination of "update" and "insert." If a document matching the query criteria is found, it will be updated with the specified document (launch). If no matching document is found, a new document will be inserted with the contents of the specified document (launch).
    {
      upsert: true,
    }
  );
}

//create new launch
async function scheduleNewLaunch(launch) {
  // here i have to select planet in which planet i have to do mission so here i have use planet databse in which i have store my launch planets or target planet name
  const planet = await planets.findOne({
    // so here i keplar_name my launch.target name is store and then it compare in the planets database
    kepler_name: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planets was found");
  }
  // create new fligtnumber
  const newFlighNumber = (await getLatestFlightNumber()) + 1;
  // here in newlaunch i have assign an object
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ["Tirth", "Nasa"],
    flightNumber: newFlighNumber,
  });
  await saveLaunch(newLaunch);
}

// here i have to abort launch
async function abortLaunchbyID(launchID) {
  // here first i have to find matched id and i have to display this launch in histroy section so dont have to delete this lauch istead of that i have done upcoming and success false
  const aborted = await launches.findOneAndUpdate(
    {
      flightNumber: launchID,
    },
    {
      upcoming: false,
      success: false,
    }
  );
  //So, aborted.modifiedCount === 1 checks if exactly one document was successfully modified by the findOneAndUpdate operation. If the condition is true, it means that the document with the specified flightNumber (launchID) was found and updated with the new values ({ upcoming: false, success: false }).
  return aborted.modifiedCount === 1;
  //The findOneAndUpdate operation returns an object that includes information about the update, and by checking aborted.modifiedCount === 1, you are verifying that exactly one document was modified by the update operation.
}

module.exports = {
  existedlaunchwithID,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchbyID,
  loadLaunchData,
};
