const addFuel = require('../functions/addFuel');
const updateFuel = require('../functions/updateFuel');
const listFuel = require('../functions/listFuels');
const deleteFuel = require('../functions/deleteFuel');
const connectDb = require('../db');

module.exports = function (app) {
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
}