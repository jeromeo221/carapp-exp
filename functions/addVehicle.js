const Vehicle = require('../models/Vehicle');
const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    let inputData = event.data;
    try {
        if(!event.userId) throw new Error('User is required');
        vehicleLib.validate(inputData);
        let vehicle = new Vehicle({
            make: inputData.make,
            model: inputData.model,
            year: inputData.year,
            user: event.userId,
            name: inputData.name,
            unit: inputData.unit
        });
        await vehicle.save();
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