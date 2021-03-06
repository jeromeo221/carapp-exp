const Vehicle = require('../models/Vehicle');
const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    let inputData = event.data;
    try {
        await vehicleLib.checkVehicleUser(event.id, event.userId);
        vehicleLib.validate(inputData);
        let vehicle = await Vehicle.findByIdAndUpdate(event.id, inputData, {new: true, useFindAndModify: false});
        return {
            success: true,
            data: vehicle
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}