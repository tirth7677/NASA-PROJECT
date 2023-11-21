const express = require('express')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const app = express()
const api = require('./routes/api')

// only write app.use(cors()) can allow any website to use data but we want to secure data so we use option obejct in which we use origin
//here if we use origin then only selected url can access our data
app.use(cors({
    origin: 'http://localhost:3000',
}))
// show how the data is represent that why we use morgan or also used to keep logs
app.use(morgan('combined'));
// When a client sends data to a server, it often sends the data in the request body, and the data can be in various formats, such as JSON. By using express.json(), you are telling Express to use its built-in middleware to parse the incoming request body as JSON.
app.use(express.json());
// all api are in api.js file so we can call it here
app.use('/v1',api)
// here we serve static file in the middleware so it already appear in our any request
app.use(express.static(path.join(__dirname,'..','public')));
// these are the two router that we use in router contain the request for frontend and backend

//here we write /* if that route is not found then it find from the react app from index.html
// this app.use middleware is only apply if some request done which is already written by us
// and if client do some invalid request then it show /* request
app.get('/*',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','public','index.html'))
})

module.exports = app;