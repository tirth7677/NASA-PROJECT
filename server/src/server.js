// in server.js we have seprate our express file so we can easily handle all middlewares

const http = require("http");
require('dotenv').config();
const app = require("./app");
const {mongoConnect} = require('./services/mongo')
const { loadPlanetsData } = require("./models/planets.model");
const {loadLaunchData} = require('./models/launches.model');
//here first we have 5000 port number which is set in package.json and if that port is not running then we apply the 8000 port number
const PORT = process.env.PORT || 8000;

//here we serve this app using the http.createserver from app mean what ever was that in app is ruuning here
const server = http.createServer(app);

//this code is to start the server and and it start as async which mean it wait till our mongocoonect() and loadplanetdata() completed then only it start 
async function startserver() {
  //bascially it has the mongourl that connect our database
  await mongoConnect();
  //load planet data is the data that come from csv file
  await loadPlanetsData();
  //Load launches from space x
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Server is listerning on ${PORT}...`);
  });
}
//execute the startserver
startserver()