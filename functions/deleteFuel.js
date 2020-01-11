const Fuel = require('../models/Fuel');
const fuelLib = require('../libs/fuel-lib');

exports.handler = async (event, context) => {
    try {
        const fuel = await Fuel.findById(event.id);
        await Fuel.findByIdAndDelete(event.id);
        await fuelLib.recalculateEfficiency(fuel);
        
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