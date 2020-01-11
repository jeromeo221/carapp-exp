const Fuel = require('../models/Fuel');

exports.handler = async (event, context) => {
    try {
        if(!event.vehicle){
            return {
                success: false,
                error: 'Vehicle is required'
            }
        }
        let fuels = await Fuel.find({ vehicle: event.vehicle }, null, {sort: 'date'});
        return {
            success: true,
            data: fuels
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}