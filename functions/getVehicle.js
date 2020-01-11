const Vehicle = require('../models/Vehicle');

exports.handler = async (event, context) => {
    try {
        let vehicle = await Vehicle.findById(event.id);
        if(!vehicle){
            return {
                success: false,
                error: 'Oops. Vehicle does not exist'
            }
        }
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