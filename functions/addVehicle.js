const Vehicle = require('../models/Vehicle');

exports.handler = async (event, context) => {
    let inputData = event.data;
    try {
        if(!event.userId) throw new Error('User is required');
        let vehicle = new Vehicle({
            make: inputData.make,
            model: inputData.model,
            year: inputData.year,
            user: event.userId,
            name: inputData.name
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