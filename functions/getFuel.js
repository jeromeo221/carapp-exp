const Fuel = require('../models/Fuel');

exports.handler = async (event, context) => {
    try {
        let fuel = await Fuel.findById(event.id);
        if(!fuel){
            return {
                success: false,
                error: 'Oops. Fuel does not exist'
            }            
        }
        return {
            success: true,
            data: fuel
        }
    } catch(err){
        return {
            success: false,
            error: err.message
        }
    }
}