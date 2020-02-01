const vehicleLib = require('../libs/vehicle-lib');

exports.handler = async (event, context) => {
    try {
        const vehicle = await vehicleLib.checkVehicleUser(event.id, event.userId);
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