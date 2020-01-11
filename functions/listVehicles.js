const Vehicle = require('../models/Vehicle');

exports.handler = async (event, context) => {
    try {
        let vehicles = await Vehicle.find({ user: "User-12345"});
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