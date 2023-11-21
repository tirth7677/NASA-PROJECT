const fs = require("fs");
const path = require('path')
//The "csv-parse" library is commonly used for reading and parsing CSV data in Node.js applications. The parse function takes a CSV string as input and converts it into a JavaScript array or object, making it easier to work with the data in your code.
const { parse } = require("csv-parse");

const planets = require('./Planets.mongo');

// here in this result is an empty array i store the whole result;
// const results = [];
// here in this habitableplanets is an empty i store the habitable planets only;

//function to find the habitable plants from koi_disposition in that we have CONFIRMED then only it pass the data
// also we have koi_insol in which 0.36 is the lowest light possible and 1.11 is the highest light possible for habitable of the planet
// also we have koi_prad in which planet radii is not more than 1.6
function ishabitableplanets(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" &&
    planet["koi_insol"] > 0.36 &&
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6
  );
}

//In Node.js, createReadStream is a method provided by the fs (file system) module that is used to create a readable stream for reading data from a file. It is a commonly used method for handling large files efficiently and asynchronously. Here are some reasons why you might use createReadStream in Node.js:
// The .pipe() function in Node.js is used to connect two streams together. In your code, you are connecting the fs.createReadStream() stream to the parse() stream. The parse() stream will parse the CSV data from the fs.createReadStream() stream and emit each parsed row as an object.
// here pipe is to connect the stram and parse do convert csv file into the json file
// comment: '#' told us that it is comment line so don't include that in json data and colums: true convert each coloum into the json data.

/*
Create new Javascript Promise

const promise = new Promise((resolve,reject)=>{
    resolve(42);
})
in this result it store 42 
Promise.then((result)=>{

})

const result = await promise;
console.log(result)

*/

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async(data) => {
        // this line push all the data into the results = [];
        // results.push(data);
        // this line push all the data into the habitablePlanets = [] but first we have to check the conditions
        if (ishabitableplanets(data)) {
          saveplanet(data)
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject(err);
      })
      .on("end",async () => {
        const countplanetsfound = (await getAllPlanets()).length
        console.log(`${countplanetsfound} habitable planets are found`);
        console.log("Done");
        resolve();
      });
  });
}

async function getAllPlanets(){
  return await planets.find({},{
    '_id': 0,'__v':0,
  });
  //'-kepler_name anothername' this is the second parameter if i want to add then
  // here '-kepler_name mean i dont want that field from planets i only want anothername from planets'
}

async function saveplanet(planet){
  //here first parameter is data i want to updateone and another parameter check if my first parameter is not exist then it can change the parameter
  try{
    await planets.findOneAndUpdate({
      //{ kepler_name: planet.kepler_name }: This is the query criteria that specify which document to update. It is looking for a document in the planets collection where the kepler_name matches the kepler_name property of the planet object.
      kepler_name: planet.kepler_name,
    },{
      //{ kepler_name: planet.kepler_name }: This is the document that will be used to update the matched document. In this case, it's using the entire planet object, specifically setting the kepler_name property. If a document with the specified kepler_name exists, it will be updated with the contents of the planet object.
      kepler_name: planet.kepler_name,
    },{
      //{ upsert: true }: This option stands for "upsert," which is a combination of "update" and "insert." If a document matching the query criteria is found, it will be updated with the specified document ({ kepler_name: planet.kepler_name }). If no matching document is found, a new document will be inserted with the contents of the specified document ({ kepler_name: planet.kepler_name }).
      upsert:true,
    });
  }catch(err){
    console.error(`could not save planet ${err}`)
  }
}

// return as a object
module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
