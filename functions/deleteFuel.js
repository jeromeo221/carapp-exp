const Fuel = require('../models/Fuel');
const fuelLib = require('../libs/fuel-lib');
const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    try {
        const fuel = await Fuel.findById(event.id);
        if(!fuel){
            throw new Error('Fuel not found');
        }
        await vehicleLib.checkVehicleUser(fuel.vehicle, event.userId);
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