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
const getUser = require('./functions/getUser');
const updateUser = require('./functions/updateUser.js');
const updateUserPwd = require('./functions/updateUserPwd');
const login = require('./functions/login');
const signup = require('./functions/signup');
const refresh = require('./functions/refresh');
const cors = require('cors');
const connectDb = require('./db');
const cookieParser = require('cookie-parser');
const authLib = require('./libs/auth-lib');

const app = express();

//Body parser middleware
app.use(cors({
    origin: process.env.FRONTEND_ENDPOINT,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

//Signup
app.post('/signup', async (req, res) => {
    let result = await connectDb();
    if(!result){
        result = await signup.handler(req.body, {});
    }
    res.json(result);
});

//Get User
app.get('/user/:id', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const payload = {
            userId: req.requestContext.authorizer.userId,
            ...req.params
        }
        result = await getUser.handler(payload, {});
    }
    res.json(result);
});

//Update User
app.put('/user/:id', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const newRequest = {
            id: req.params.id,
            userId: req.requestContext.authorizer.userId,
            data: req.body.data
        }
        result = await updateUser.handler(newRequest, {});
    }    
    res.json(result);
});

//Change password
app.put('/user/:id/changepwd', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const newRequest = {
            id: req.params.id,
            userId: req.requestContext.authorizer.userId,
            data: req.body.data
        }
        result = await updateUserPwd.handler(newRequest, {});
    }    
    res.json(result);
});

//Login
app.post('/login', async (req, res) => {
    let result = await connectDb();
    if(!result){
        result = await login.handler(req.body, {});
        if(result.success){
            authLib.sendRefreshToken(res, result.data.rtoken);
            res.json({
                success: result.success,
                data: {
                    token: result.data.token
                }
            });
            return;
        }
    }
    res.json(result);
});

//Logout
app.post('/logout', (req, res) => {
    try {
        authLib.sendRefreshToken(res, '');
        res.json({ success: true })
    } catch(err){
        res.json({
            success: false,
            error: err.message
        })
    }
});

//Refresh
app.post('/refresh', async (req, res) => {
    result = await refresh.handler(req.cookies, {});
    if(result.success){
        authLib.sendRefreshToken(res, result.data.rtoken);
        res.json({
            success: result.success,
            data: {
                token: result.data.token
            }
        });
    } else {
        res.json(result);
    }
});

//Create a vehicle
app.post('/vehicles', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const payload = {
            userId: req.requestContext.authorizer.userId,
            ...req.body
        }
        result = await addVehicle.handler(payload, {});
    }
    res.json(result);
});

//Get a vehicle
app.get('/vehicles/:id', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const payload = {
            userId: req.requestContext.authorizer.userId,
            ...req.params
        }
        result = await getVehicle.handler(payload, {});
    }
    res.json(result);
});

//List a vehicle
app.get('/vehicles', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const payload = {
            userId: req.requestContext.authorizer.userId,
            ...req.body
        }
        result = await listVehicle.handler(payload, {});
    }
    res.json(result);
});

//Update a vehicle
app.put('/vehicles/:id', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const newRequest = {
            id: req.params.id,
            userId: req.requestContext.authorizer.userId,
            data: req.body.data
        }
        result = await updateVehicle.handler(newRequest, {});
    }    
    res.json(result);
});

//Delete a vehicle
app.delete('/vehicles/:id', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const payload = {
            id: req.params.id,
            userId: req.requestContext.authorizer.userId
        }
        result = await deleteVehicle.handler(payload, {});
    }
    res.json(result); 
});

//Add a fuel
app.post('/fuels', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const payload = {
            userId: req.requestContext.authorizer.userId,
            data: req.body
        }
        result = await addFuel.handler(payload, {});
    }
    res.json(result);
});

//Update a fuel
app.put('/fuels/:id', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const newRequest = {
            id: req.params.id,
            userId: req.requestContext.authorizer.userId,
            data: req.body
        }
        result = await updateFuel.handler(newRequest, {});
    }
    res.json(result);
});

//Delete Fuel
app.delete('/fuels/:id', async (req, res) => {
    let result = await connectDb();
    if(!result){
        const payload = {
            id: req.params.id,
            userId: req.requestContext.authorizer.userId
        }
        result = await deleteFuel.handler(payload, {});
    }
    res.json(result);
});

//List fuel
app.get('/fuels', async (req, res) => {
    let result = await connectDb();
    if(!result){
        result = await listFuel.handler(
            { 
                vehicle: req.query.vehicleId,
                userId: req.requestContext.authorizer.userId,
                page: req.query.page,
                limit: req.query.limit
            }, {});
    }
    res.json(result);
});

module.exports.handler = serverless(app);