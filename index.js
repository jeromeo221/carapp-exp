const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

//Body parser middleware
app.use(cors({
    origin: process.env.FRONTEND_ENDPOINT,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

require('./routes/user-route')(app);
require('./routes/vehicle-route')(app);
require('./routes/fuel-route')(app);

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

module.exports.handler = serverless(app);