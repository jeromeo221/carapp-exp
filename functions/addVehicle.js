const Vehicle = require('../models/Vehicle');

exports.handler = async (event, context) => {
    let inputData = event.data;
    let vehicle = new Vehicle({
        make: inputData.make,
        model: inputData.model,
        year: inputData.year,
        user: "User-12345",
        name: inputData.name
    });
    try {
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