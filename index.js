const serverless = require('serverless-http');
const express = require('express');
const addVehicle = require('./functions/addVehicle');
const getVehicle = require('./functions/getVehicle');
const listVehicle = require('./functions/listVehicles');
const updateVehicle = require('./functions/updateVehicle');
const deleteVehicle = require('./functions/deleteVehicle');
const addFuel = require('./functions/addFuel');
const updateFuel = require('./functions/updateFuel');
const listFuel = require('./functions/listFuels');
const deleteFuel = require('./functions/deleteFuel');
const cors = require('cors');
const connectDb = require('./db');

const app = express();

//Body parser middleware
app.use(cors());
app.use(express.json());

//Create a vehicle
app.post('/vehicles', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    result = await addVehicle.handler(req.body, {});
    res.json(result);
});

//Get a vehicle
app.get('/vehicles/:id', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    result = await getVehicle.handler(req.params, {});
    res.json(result);
});

//List a vehicle
app.get('/vehicles', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    result = await listVehicle.handler(req.body, {});
    res.json(result);
});

//Update a vehicle
app.put('/vehicles/:id', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    const newRequest = {
        id: req.params.id,
        data: req.body.data
    }
    result = await updateVehicle.handler(newRequest, {});
    res.json(result);
});

//Delete a vehicle
app.delete('/vehicles/:id', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    result = await deleteVehicle.handler({ id: req.params.id }, {});
    res.json(result); 
});

//Add a fuel
app.post('/fuels', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    result = await addFuel.handler({data: req.body}, {});
    res.json(result);
});

//Update a fuel
app.put('/fuels/:id', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    const newRequest = {
        id: req.params.id,
        data: req.body
    }
    result = await updateFuel.handler(newRequest, {});
    res.json(result);
});

//Delete Fuel
app.delete('/fuels/:id', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    result = await deleteFuel.handler({ id: req.params.id }, {});
    res.json(result);
});

//List fuel
app.get('/fuels', async (req, res) => {
    let result;
    try {
        await connectDb();
    } catch(err){
        result = {
            success: false,
            error: 'Unable to connect to database'
        }
    }
    result = await listFuel.handler({ vehicle: req.query.vehicleId }, {});
    res.json(result);
});

module.exports.handler = serverless(app);