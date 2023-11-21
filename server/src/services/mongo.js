const mongoose = require("mongoose");
// you have to write password and after mongodb.net you have to write the project name which is given in mongodb /nasa
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL;
// This code listens for the "open" event on the Mongoose connection.
// The callback function is executed only once when the "open" event occurs, and it logs the specified message to the console.
// The use of .once ensures that the callback is executed only for the first occurrence of the "open" event. If the "open" event happens again later (which is unlikely during the lifetime of a single application), this particular callback won't be executed again.
//mongoose.connection is an event emitter. It can emit various events based on the state of the connection, such as "open" when the connection is successfully opened and "error" when an error occurs during the connection.
mongoose.connection.once("open", () => {
  console.log("Mongodb connection ready");
});

//here .on mean whenever event occure it show error message
mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect(){
    await mongoose.connect(MONGO_URL)
}

//In Mongoose, the mongoose.disconnect() function is used to close the default connection to the MongoDB server. This function is asynchronous and returns a Promise that resolves once the disconnection is complete.
async function mongoDisconnect(){
    await mongoose.disconnect();
}

module.exports = {
    mongoConnect,
    mongoDisconnect,
}