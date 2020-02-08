const Vehicle = require('../models/Vehicle');

exports.handler = async (event, context) => {
    try {
        if(!event.userId) throw new Error('User is required');
        let vehicles = await Vehicle.find({ user: event.userId});
        return {
            success: true,
            data: vehicles
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}