const addVehicle = require('../functions/addVehicle');
const getVehicle = require('../functions/getVehicle');
const listVehicle = require('../functions/listVehicles');
const updateVehicle = require('../functions/updateVehicle');
const deleteVehicle = require('../functions/deleteVehicle');
const connectDb = require('../db');

module.exports = function (app) {
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
}